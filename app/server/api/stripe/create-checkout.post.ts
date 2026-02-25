/**
 * Stripe Checkout Session Creator
 *
 * Creates a Stripe Checkout session for the given plan.
 * The user is redirected to Stripe's hosted checkout page.
 * On success, Stripe fires a webhook → we update the organization.
 */
import Stripe from 'stripe'
import { Logger } from '~/utils/Logger'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody(event)

    // Support both organizationId and legacy tenantId from client
    const { planId, userId, userEmail } = body
    const organizationId = body.organizationId || body.tenantId || ''

    Logger.info('[Stripe Checkout] Creating checkout session', {
        planId,
        organizationId
    })

    if (!planId || !userId) {
        Logger.warn('[Stripe Checkout] Missing required fields')
        throw createError({ statusCode: 400, statusMessage: 'planId and userId are required' })
    }

    if (!config.stripeSecretKey) {
        Logger.error('[Stripe Checkout] Stripe not configured — STRIPE_SECRET_KEY missing')
        throw createError({ statusCode: 500, statusMessage: 'Stripe is not configured. Add STRIPE_SECRET_KEY to .env' })
    }

    // Resolve Stripe price ID from server-side config
    const priceMap: Record<string, string> = {
        starter: config.stripePriceStarter as string || '',
        growth: config.stripePriceGrowth as string || '',
        scale: config.stripePriceScale as string || ''
    }
    const priceId = priceMap[planId]

    Logger.info('[Stripe Checkout] Resolved price', {
        planId,
        priceId: priceId || 'NOT_FOUND',
        availablePrices: Object.entries(priceMap).map(([k, v]) => `${k}=${v ? '✓' : '✗'}`)
    })

    if (!priceId) {
        Logger.error(`[Stripe Checkout] No Stripe price configured for plan: ${planId}`)
        throw createError({ statusCode: 400, statusMessage: `No Stripe price configured for plan: ${planId}. Add STRIPE_PRICE_${planId.toUpperCase()} to .env` })
    }

    const stripe = new Stripe(config.stripeSecretKey as string)

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            customer_email: userEmail || undefined,
            allow_promotion_codes: true,
            metadata: {
                userId,
                tenantId: organizationId || 'pending',
                planId
            },
            success_url: `${getRequestURL(event).origin}/organization?checkout=success`,
            cancel_url: `${getRequestURL(event).origin}/pricing?checkout=canceled`
        })

        Logger.info('[Stripe Checkout] ✓ Session created', {
            sessionUrl: session.url ? 'present' : 'MISSING'
        })

        return { sessionUrl: session.url }
    } catch (err: any) {
        Logger.error('[Stripe Checkout] Checkout error', err)
        throw createError({ statusCode: 500, statusMessage: err.message })
    }
})
