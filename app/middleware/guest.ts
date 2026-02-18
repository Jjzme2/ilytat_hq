import { getCurrentUser } from 'vuefire'

export default defineNuxtRouteMiddleware(async (to, from) => {
    // Validating auth on the server is tricky without session cookies.
    // We defer to client-side.
    if (import.meta.server) return;

    try {
        const user = await getCurrentUser();
        if (user) {
            Logger.info('[GuestMiddleware] User is already authenticated. Redirecting.');
            const returnTo = (to.query.redirect as string) || '/';
            // Use replace to avoid browser history sticking on login page
            return navigateTo(returnTo, { replace: true });
        }
    } catch (error) {
        // If getting user fails, assume they are guest and allow access to login
        Logger.warn('[GuestMiddleware] Error checking auth status:', error);
    }
});
