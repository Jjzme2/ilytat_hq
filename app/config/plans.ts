/**
 * Plan Definitions — Pricing tiers for ILYTAT HQ
 *
 * Each plan defines the Stripe price ID, display info, and feature limits.
 * The `maxMembers` field gates how many users a tenant owner can invite.
 *
 * 12-Month Rule: To add a new plan, add one entry here and create a
 * matching price in the Stripe Dashboard. Everything else is automatic.
 */

export interface PlanDefinition {
    /** Unique plan ID, matches Tenant.plan field */
    id: 'starter' | 'growth' | 'scale'
    /** Display name */
    name: string
    /** Monthly price in USD */
    price: number
    /** Stripe Price ID (set after creating in Stripe Dashboard) */
    stripePriceId: string
    /** Maximum team members (including the owner) */
    maxMembers: number
    /** Short description */
    description: string
    /** Feature highlights for the pricing card */
    features: string[]
    /** Whether this is the recommended plan */
    recommended?: boolean
}

export const PLANS: PlanDefinition[] = [
    {
        id: 'starter',
        name: 'Starter',
        price: 15,
        stripePriceId: '',  // Resolved server-side via runtimeConfig
        maxMembers: 2,
        description: 'Perfect for solo founders getting started.',
        features: [
            'Projects & collaboration',
            'Goals & milestones',
            'Tasks & to-dos',
            'Document management',
            '2 team members'
        ]
    },
    {
        id: 'growth',
        name: 'Growth',
        price: 25,
        stripePriceId: '',  // Resolved server-side via runtimeConfig
        maxMembers: 10,
        description: 'For growing teams building their business.',
        features: [
            'Everything in Starter',
            'Finance & budgets',
            'AI tools & insights',
            'Inbox & messaging',
            'Schedule & calendar',
            '10 team members'
        ],
        recommended: true
    },
    {
        id: 'scale',
        name: 'Scale',
        price: 50,
        stripePriceId: '',  // Resolved server-side via runtimeConfig
        maxMembers: 50,
        description: 'For established teams ready to scale.',
        features: [
            'Everything in Growth',
            'Custom themes & branding',
            '50 team members',
            'Priority support',
            'API access'
        ]
    }
]

/** Get a plan definition by its ID */
export const getPlan = (planId: string): PlanDefinition | undefined => {
    return PLANS.find(p => p.id === planId)
}

/** Get max members for a given plan */
export const getMaxMembers = (planId: string): number => {
    return getPlan(planId)?.maxMembers ?? 2
}
