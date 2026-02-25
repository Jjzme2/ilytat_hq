/**
 * Stripe Customer Portal Session
 *
 * Creates a portal session so the organization owner can manage their subscription
 * (upgrade, downgrade, cancel, update payment method) via Stripe's hosted UI.
 */
import Stripe from 'stripe'
import { Logger } from '~/utils/Logger'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody(event)
    const { stripeCustomerId } = body

    if (!stripeCustomerId) {
        Logger.warn('[Stripe Portal] Missing stripeCustomerId in request')
        throw createError({ statusCode: 400, statusMessage: 'stripeCustomerId is required' })
    }

    if (!config.stripeSecretKey) {
        Logger.error('[Stripe Portal] Stripe not configured')
        throw createError({ statusCode: 500, statusMessage: 'Stripe is not configured' })
    }

    const stripe = new Stripe(config.stripeSecretKey as string)

    try {
        Logger.info('[Stripe Portal] Creating portal session', { stripeCustomerId })
        const session = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${getRequestURL(event).origin}/organization`
        })

        Logger.info('[Stripe Portal] ✓ Portal session created', { url: session.url ? 'present' : 'MISSING' })
        return { portalUrl: session.url }
    } catch (err: any) {
        Logger.error('[Stripe Portal] Portal error', err, { stripeCustomerId })
        throw createError({ statusCode: 500, statusMessage: err.message })
    }
})
