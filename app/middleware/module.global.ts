export default defineNuxtRouteMiddleware(async (to) => {
    // We only care about client-side navigation for module gating to avoid SSR issues with auth state
    if (import.meta.server) return

    // Wait for user profile to be fully loaded before checking org membership.
    // Without this, organizationId is empty on cold load → perpetual /tenant-setup redirect.
    const { ensureUserIsReady } = useUser()
    await ensureUserIsReady()

    const { allModules } = useModules()

    // Check if the route matches any module's route
    for (const module of allModules) {
        if (to.path === module.route || (module.route !== '/' && to.path.startsWith(`${module.route}/`))) {
            const { organization, organizationPending, isOrgMember } = useOrganization()

            // Wait for organization to finish loading if it's currently pending
            if (organizationPending.value) {
                // Poll every 50ms until it resolves (max 3 seconds)
                let attempts = 0;
                while (organizationPending.value && attempts < 60) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                    attempts++;
                }
            }

            const { isModuleEnabled } = useModules()
            if (!isModuleEnabled(module.id)) {
                if (!isOrgMember.value) {
                    return navigateTo('/tenant-setup')
                } else if (module.requiredPlan) {
                    return navigateTo(`/pricing?upgrade=${module.requiredPlan}`)
                } else {
                    return navigateTo('/')
                }
            }
        }
    }
})
