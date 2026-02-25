/**
 * Sync Subscription Status
 *
 * Client-callable endpoint to sync Stripe subscription data to the organization.
 * This is the fallback for when webhooks don't reach the dev server.
 * In production, webhooks handle this — but this endpoint is useful for:
 * 1. Dev/sandbox where `stripe listen` isn't running
 * 2. Manual "refresh" of subscription status
 * 3. Initial activation after checkout redirect
 *
 * 12-Month Rule: This reads the latest subscription from Stripe and
 * writes it to the org doc. It's idempotent — safe to call multiple times.
 */
import Stripe from 'stripe'
import { getFirestore } from 'firebase-admin/firestore'
import { ensureAdminInitialized } from '../../utils/adminAuth'
import { Logger } from '~/utils/Logger'

function getDb() {
    ensureAdminInitialized()
    return getFirestore()
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody(event)
    // Support both organizationId and legacy tenantId from client
    const organizationId = body.organizationId || body.tenantId

    Logger.info('[Stripe Sync] Sync request received', { organizationId })

    if (!organizationId) {
        Logger.warn('[Stripe Sync] No organizationId provided in request body')
        throw createError({ statusCode: 400, statusMessage: 'organizationId is required' })
    }

    if (!config.stripeSecretKey) {
        Logger.error('[Stripe Sync] Stripe not configured — STRIPE_SECRET_KEY missing')
        throw createError({ statusCode: 500, statusMessage: 'Stripe not configured' })
    }

    const stripe = new Stripe(config.stripeSecretKey as string)
    const db = getDb()

    // Read the organization document (collection is still 'tenants' for data continuity)
    const tenantDoc = await db.collection('tenants').doc(organizationId).get()
    if (!tenantDoc.exists) {
        Logger.warn('[Stripe Sync] Organization doc not found', { organizationId })
        throw createError({ statusCode: 404, statusMessage: 'Organization not found' })
    }

    const tenantData = tenantDoc.data()!
    Logger.info('[Stripe Sync] Found organization doc', {
        organizationId,
        hasCustomerId: !!tenantData.stripeCustomerId,
        currentPlan: tenantData.plan || 'NONE',
        currentStatus: tenantData.subscriptionStatus || 'NONE',
        memberCount: (tenantData.memberIds || []).length
    })

    // Path 1: Organization has a Stripe customer ID — look up their latest subscription
    if (tenantData.stripeCustomerId) {
        Logger.info('[Stripe Sync] Looking up subscriptions for customer')

        const subscriptions = await stripe.subscriptions.list({
            customer: tenantData.stripeCustomerId,
            limit: 1,
            status: 'all'
        })

        Logger.info('[Stripe Sync] Stripe subscriptions found', {
            count: subscriptions.data.length
        })

        if (subscriptions.data.length > 0) {
            const sub = subscriptions.data[0]!
            const priceId = sub.items.data[0]?.price?.id || ''
            const resolvedPlan = resolvePlanId(config, priceId)
            const rawEnd = (sub as any).current_period_end
            const periodEnd = rawEnd ? new Date(rawEnd * 1000).toISOString() : new Date().toISOString()
            const isActive = sub.status === 'active' || sub.status === 'trialing'

            Logger.info('[Stripe Sync] Resolved subscription', {
                status: sub.status,
                resolvedPlan,
                isActive
            })

            await tenantDoc.ref.update({
                stripeSubscriptionId: sub.id,
                subscriptionStatus: sub.status,
                plan: resolvedPlan,
                maxMembers: getMaxMembers(resolvedPlan),
                updatedAt: new Date().toISOString()
            })

            // Update subscriberTier on all organization members
            await updateMemberTiers(db, organizationId, isActive ? resolvedPlan : null, isActive ? periodEnd : null)

            Logger.info('[Stripe Sync] ✓ Sync complete via customer ID', { organizationId, resolvedPlan, status: sub.status })

            return {
                synced: true,
                plan: resolvedPlan,
                status: sub.status,
                maxMembers: getMaxMembers(resolvedPlan)
            }
        } else {
            Logger.warn('[Stripe Sync] Customer has no subscriptions')
        }
    }

    // Path 2: No Stripe customer yet — check if there's a recent checkout session for this org
    Logger.info('[Stripe Sync] No stripeCustomerId, searching recent checkout sessions', { organizationId })

    try {
        const sessions = await stripe.checkout.sessions.list({ limit: 10 })

        Logger.info('[Stripe Sync] Recent checkout sessions', {
            count: sessions.data.length
        })

        // Match by organizationId, OR by userId when tenantId was 'pending'
        const matchingSession = sessions.data.find(
            s => (s.metadata?.tenantId === organizationId ||
                (s.metadata?.tenantId === 'pending' && s.metadata?.userId))
                && s.payment_status === 'paid'
        )

        if (matchingSession && matchingSession.subscription) {
            Logger.info('[Stripe Sync] Found matching checkout session')

            const sub = await stripe.subscriptions.retrieve(matchingSession.subscription as string)
            const planId = matchingSession.metadata?.planId || ''
            const priceId = sub.items.data[0]?.price?.id || ''
            const resolvedPlan = planId || resolvePlanId(config, priceId)
            const rawEnd = (sub as any).current_period_end
            const periodEnd = rawEnd ? new Date(rawEnd * 1000).toISOString() : new Date().toISOString()

            Logger.info('[Stripe Sync] Subscription from session', {
                status: sub.status,
                resolvedPlan
            })

            await tenantDoc.ref.update({
                stripeCustomerId: matchingSession.customer as string,
                stripeSubscriptionId: sub.id,
                subscriptionStatus: sub.status,
                plan: resolvedPlan,
                maxMembers: getMaxMembers(resolvedPlan),
                updatedAt: new Date().toISOString()
            })

            // Update subscriberTier on all organization members
            await updateMemberTiers(db, organizationId, resolvedPlan, periodEnd)

            Logger.info('[Stripe Sync] ✓ Sync complete via session lookup', { organizationId, resolvedPlan })

            return {
                synced: true,
                plan: resolvedPlan,
                status: sub.status,
                maxMembers: getMaxMembers(resolvedPlan)
            }
        } else {
            Logger.warn('[Stripe Sync] No matching paid session found for organization', { organizationId })
        }
    } catch (err: any) {
        Logger.error('[Stripe Sync] Session lookup failed', err, { organizationId })
    }

    Logger.info('[Stripe Sync] No sync performed — returning current state', {
        organizationId,
        plan: tenantData.plan || 'free',
        status: tenantData.subscriptionStatus || 'none'
    })

    return { synced: false, plan: tenantData.plan || 'free', status: tenantData.subscriptionStatus || 'none' }
})

function resolvePlanId(config: any, priceId: string): string {
    const map: Record<string, string> = {}
    if (config.stripePriceStarter) map[config.stripePriceStarter] = 'starter'
    if (config.stripePriceGrowth) map[config.stripePriceGrowth] = 'growth'
    if (config.stripePriceScale) map[config.stripePriceScale] = 'scale'
    const resolved = map[priceId] || 'starter'
    Logger.debug('[Stripe Sync] Resolved price → plan', { resolved })
    return resolved
}

function getMaxMembers(planId: string): number {
    return { starter: 2, growth: 10, scale: 50 }[planId] || 2
}

async function updateMemberTiers(
    db: FirebaseFirestore.Firestore,
    organizationId: string,
    tier: string | null,
    expiresAt: string | null
) {
    try {
        const tenantDoc = await db.collection('tenants').doc(organizationId).get()
        const memberIds: string[] = tenantDoc.data()?.memberIds || []

        Logger.info('[Stripe Sync] updateMemberTiers', {
            organizationId,
            tier,
            memberCount: memberIds.length
        })

        if (memberIds.length === 0) {
            Logger.warn('[Stripe Sync] ⚠ No members in organization — subscriberTier will NOT be updated', {
                organizationId
            })
            return
        }

        const batch = db.batch()
        for (const uid of memberIds) {
            const userRef = db.collection('users').doc(uid)
            batch.update(userRef, {
                subscriberTier: tier,
                subscriberTierExpiresAt: expiresAt
            })
            Logger.debug('[Stripe Sync] Queued tier update')
        }
        await batch.commit()
        Logger.info(`[Stripe Sync] ✓ Updated subscriberTier=${tier} for ${memberIds.length} members`)
    } catch (err: any) {
        Logger.error('[Stripe Sync] Failed to update member tiers', err, {
            organizationId,
            tier,
            expiresAt
        })
    }
}
