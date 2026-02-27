/**
 * Subscription Middleware
 *
 * Checks if the current user has an active subscription (via their organization).
 * Redirects non-subscribers to the pricing page.
 *
 * Pages that should be accessible WITHOUT a subscription:
 * - /pricing, /login, /tenant-setup (for viewing status)
 *
 * 12-Month Rule: This middleware checks the organization's subscriptionStatus.
 * If the user has no organization, they're redirected to pricing.
 * If their subscription is canceled/past_due, they see a warning but can still access.
 */
export default defineNuxtRouteMiddleware(async (to) => {
    // Skip on server — auth state isn't reliably available during SSR
    if (import.meta.server) return

    // Pages that don't require a subscription
    const freePages = ['/pricing', '/login', '/tenant-setup', '/organization']
    if (freePages.some(p => to.path.startsWith(p))) {
        return
    }

    // Wait for user profile to be fully loaded before checking org membership.
    // Without this, organizationId is empty on cold load → perpetual /tenant-setup redirect.
    const { ensureUserIsReady } = useUser()
    await ensureUserIsReady()

    const { organization, organizationId } = useOrganization()

    // No organization at all → redirect to tenant setup (which handles the flow)
    if (!organizationId.value) {
        return navigateTo('/tenant-setup')
    }

    // Has organization but subscription is not active
    if (organization.value) {
        const status = (organization.value as any).subscriptionStatus || 'none'
        if (status === 'none' || status === 'canceled') {
            return navigateTo('/pricing')
        }
    }
})
