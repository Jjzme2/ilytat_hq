import { getCurrentUser } from 'vuefire'

export default defineNuxtRouteMiddleware(async (to, from) => {
    // If we're on the server, we might not have auth state unless using session cookies.
    // We'll let the client-side handle the redirect to be safe and consistent with auth.ts
    if (import.meta.server) {
        return;
    }

    const { ensureUserIsReady } = useUser();

    // 1. Check for Firebase Auth session
    const fUser = await getCurrentUser();

    // 2. If user is logged in, redirect them away
    if (fUser) {
        Logger.info(`[GuestMiddleware] User is already logged in. Redirecting to dashboard.`);

        // Check for a 'redirect' query param to return them to where they were trying to go, 
        // though typically coming to login/signup means they want to go to dashboard if already logged in.
        // For 'guest' middleware, usually we just want to send them to the dashboard.
        const returnTo = to.query.redirect as string || '/';
        return navigateTo(returnTo);
    }
});
