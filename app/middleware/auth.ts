import { getCurrentUser } from 'vuefire'

export default defineNuxtRouteMiddleware(async (to, from) => {
    // If we're on the server and not using session cookies, we can't verify auth reliably.
    // We let the client-side middleware handle it after hydration.
    if (import.meta.server) return;

    const { ensureUserIsReady, isAdmin } = useUser();

    // 1. Wait for Firebase Auth session to be restored
    const fUser = await getCurrentUser();
    if (!fUser) return navigateTo('/login');

    // 2. Wait for useUser to fetch the Firestore profile
    await ensureUserIsReady();

    // Specific check for admin routes if needed
    if (to.path.startsWith('/admin') && !isAdmin.value) {
        return navigateTo('/');
    }
});
