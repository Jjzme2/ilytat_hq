/**
 * Stripe Webhook Handler
 *
 * Receives Stripe events and updates Firestore organization documents.
 * Key events: checkout.session.completed, customer.subscription.updated/deleted
 *
 * 12-Month Rule: Stripe signs all webhooks. We verify the signature
 * with STRIPE_WEBHOOK_SECRET to prevent spoofing. If you change the
 * webhook endpoint URL in Stripe Dashboard, update the secret here.
 *
 * Intent: The `updateMemberTiers` function writes `subscriberTier` to
 * each user document in the organization's memberIds array. This is how
 * per-user tier access is determined at the application level.
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

    if (!config.stripeSecretKey || !config.stripeWebhookSecret) {
        Logger.error('[Stripe Webhook] Stripe webhook not configured — missing stripeSecretKey or stripeWebhookSecret')
        throw createError({ statusCode: 500, statusMessage: 'Stripe webhook not configured' })
    }

    const stripe = new Stripe(config.stripeSecretKey as string)
    const body = await readRawBody(event)
    const sig = getHeader(event, 'stripe-signature')

    if (!body || !sig) {
        Logger.warn('[Stripe Webhook] Missing body or signature in webhook request')
        throw createError({ statusCode: 400, statusMessage: 'Missing body or signature' })
    }

    let stripeEvent: Stripe.Event

    try {
        stripeEvent = stripe.webhooks.constructEvent(body, sig, config.stripeWebhookSecret as string)
        Logger.info(`[Stripe Webhook] Received event: ${stripeEvent.type}`, { eventId: stripeEvent.id })
    } catch (err: any) {
        Logger.error('[Stripe Webhook] Signature verification failed', err)
        throw createError({ statusCode: 400, statusMessage: 'Invalid signature' })
    }

    const db = getDb()

    switch (stripeEvent.type) {
        case 'checkout.session.completed': {
            const session = stripeEvent.data.object as Stripe.Checkout.Session
            const userId = session.metadata?.userId
            const planId = session.metadata?.planId

            Logger.info('[Stripe Webhook] checkout.session.completed', {
                userId,
                planId,
                sessionId: session.id,
                subscriptionId: session.subscription,
                metadataTenantId: session.metadata?.tenantId
            })

            // Resolve organizationId: check metadata first, then user doc, then createdBy query
            let organizationId = session.metadata?.tenantId || ''

            if (!organizationId || organizationId === 'pending' || organizationId === '') {
                Logger.info('[Stripe Webhook] No organizationId in metadata, looking up from user doc', { userId })

                if (userId) {
                    const userDoc = await db.collection('users').doc(userId).get()
                    if (userDoc.exists) {
                        const userData = userDoc.data()
                        // Support both new organizationId and legacy tenantId field
                        organizationId = userData?.organizationId || userData?.tenantId || ''
                        Logger.info('[Stripe Webhook] Found organizationId from user doc', {
                            userId,
                            organizationId,
                            hadOrganizationId: !!userData?.organizationId,
                            hadTenantId: !!userData?.tenantId
                        })
                    } else {
                        Logger.warn('[Stripe Webhook] User doc not found', { userId })
                    }
                }

                // Still no org? Try finding one created by this user
                if (!organizationId) {
                    Logger.info('[Stripe Webhook] Still no org, searching tenants by createdBy', { userId })
                    const tenantSnap = await db.collection('tenants')
                        .where('createdBy', '==', userId)
                        .limit(1)
                        .get()
                    if (!tenantSnap.empty) {
                        organizationId = tenantSnap.docs[0]?.id || ''
                        Logger.info('[Stripe Webhook] Found org via createdBy query', { organizationId })
                    } else {
                        Logger.warn('[Stripe Webhook] No organization found for user', { userId })
                    }
                }
            }

            if (userId && organizationId) {
                const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
                const resolvedPlan = planId || getPlanIdFromPriceId(config, subscription.items.data[0]?.price?.id || '')
                const rawEnd = (subscription as any).current_period_end
                const periodEnd = rawEnd ? new Date(rawEnd * 1000).toISOString() : new Date().toISOString()

                Logger.info('[Stripe Webhook] Activating subscription', {
                    organizationId,
                    resolvedPlan,
                    subscriptionStatus: subscription.status,
                    periodEnd
                })

                await db.collection('tenants').doc(organizationId).update({
                    stripeCustomerId: session.customer as string,
                    stripeSubscriptionId: session.subscription as string,
                    subscriptionStatus: subscription.status,
                    plan: resolvedPlan,
                    maxMembers: getMaxMembersForPlan(resolvedPlan),
                    updatedAt: new Date().toISOString()
                })

                // Update subscriberTier on all organization members
                await updateMemberTiers(db, organizationId, resolvedPlan, periodEnd)

                Logger.info('[Stripe Webhook] ✓ Subscription activated', { organizationId, plan: resolvedPlan })
            } else {
                Logger.warn('[Stripe Webhook] checkout.session.completed but missing userId or organizationId', {
                    userId,
                    organizationId
                })
            }
            break
        }

        case 'customer.subscription.updated': {
            const subscription = stripeEvent.data.object as Stripe.Subscription
            Logger.info('[Stripe Webhook] customer.subscription.updated', {
                subscriptionId: subscription.id,
                status: subscription.status
            })

            const snapshot = await db.collection('tenants')
                .where('stripeSubscriptionId', '==', subscription.id)
                .limit(1)
                .get()

            if (!snapshot.empty) {
                const tenantDoc = snapshot.docs[0]
                const resolvedPlan = getPlanIdFromPriceId(config, subscription.items.data[0]?.price?.id || '')
                const rawEnd = (subscription as any).current_period_end
                const periodEnd = rawEnd ? new Date(rawEnd * 1000).toISOString() : new Date().toISOString()

                Logger.info('[Stripe Webhook] Updating org subscription', {
                    orgId: tenantDoc?.id,
                    resolvedPlan,
                    status: subscription.status
                })

                await tenantDoc?.ref.update({
                    subscriptionStatus: subscription.status,
                    plan: resolvedPlan,
                    maxMembers: getMaxMembersForPlan(resolvedPlan),
                    updatedAt: new Date().toISOString()
                })

                // Update subscriberTier on all organization members
                if (tenantDoc?.id) {
                    const tier = subscription.status === 'active' || subscription.status === 'trialing'
                        ? resolvedPlan : null
                    await updateMemberTiers(db, tenantDoc.id, tier, tier ? periodEnd : null)
                }

                Logger.info('[Stripe Webhook] ✓ Subscription updated', { orgId: tenantDoc?.id })
            } else {
                Logger.warn('[Stripe Webhook] No org found for subscription', { subscriptionId: subscription.id })
            }
            break
        }

        case 'customer.subscription.deleted': {
            const subscription = stripeEvent.data.object as Stripe.Subscription
            Logger.info('[Stripe Webhook] customer.subscription.deleted', { subscriptionId: subscription.id })

            const snapshot = await db.collection('tenants')
                .where('stripeSubscriptionId', '==', subscription.id)
                .limit(1)
                .get()

            if (!snapshot.empty) {
                const tenantDoc = snapshot.docs[0]
                await tenantDoc?.ref.update({
                    subscriptionStatus: 'canceled',
                    updatedAt: new Date().toISOString()
                })

                // Clear subscriberTier on all organization members
                if (tenantDoc?.id) {
                    await updateMemberTiers(db, tenantDoc.id, null, null)
                }

                Logger.info('[Stripe Webhook] ✓ Subscription canceled', { orgId: tenantDoc?.id })
            } else {
                Logger.warn('[Stripe Webhook] No org found for deleted subscription', { subscriptionId: subscription.id })
            }
            break
        }

        default: {
            Logger.debug(`[Stripe Webhook] Unhandled event type: ${stripeEvent.type}`)
        }
    }

    return { received: true }
})

// Helper: map Stripe price ID → plan ID using runtimeConfig
function getPlanIdFromPriceId(config: any, priceId: string): string {
    const map: Record<string, string> = {}
    if (config.stripePriceStarter) map[config.stripePriceStarter] = 'starter'
    if (config.stripePriceGrowth) map[config.stripePriceGrowth] = 'growth'
    if (config.stripePriceScale) map[config.stripePriceScale] = 'scale'
    const resolved = map[priceId] || 'starter'
    Logger.debug('[Stripe Webhook] Resolved price → plan', { priceId, resolved })
    return resolved
}

// Helper: map plan ID → max members
function getMaxMembersForPlan(planId: string): number {
    const map: Record<string, number> = {
        starter: 2,
        growth: 10,
        scale: 50
    }
    return map[planId] || 2
}

/**
 * Update subscriberTier on all user docs belonging to an organization.
 * Called when subscription activates, updates, or cancels.
 * Pass null for tier/expiresAt to clear on cancellation.
 */
async function updateMemberTiers(
    db: FirebaseFirestore.Firestore,
    organizationId: string,
    tier: string | null,
    expiresAt: string | null
) {
    try {
        const tenantDoc = await db.collection('tenants').doc(organizationId).get()
        const memberIds: string[] = tenantDoc.data()?.memberIds || []

        Logger.info('[Stripe Webhook] updateMemberTiers', {
            organizationId,
            tier,
            expiresAt,
            memberCount: memberIds.length,
            memberIds
        })

        if (memberIds.length === 0) {
            Logger.warn('[Stripe Webhook] No members found in organization — subscriberTier will NOT be updated', {
                organizationId,
                docExists: tenantDoc.exists,
                docData: tenantDoc.data()
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
            Logger.debug('[Stripe Webhook] Queued tier update for user', { uid, tier })
        }
        await batch.commit()
        Logger.info(`[Stripe Webhook] ✓ Updated subscriberTier=${tier} for ${memberIds.length} members of org ${organizationId}`)
    } catch (err: any) {
        Logger.error(`[Stripe Webhook] Failed to update member tiers for org ${organizationId}`, err, {
            organizationId,
            tier,
            expiresAt
        })
    }
}
