import { getCurrentUser } from 'vuefire'


export default defineNuxtRouteMiddleware(async (to, from) => {
    // Validating auth on the server is tricky without session cookies.
    // We defer to client-side for immediate redirection.
    if (import.meta.server) return;

    try {
        const user = await getCurrentUser();
        if (user) {
            Logger.info('[GuestMiddleware] User is already authenticated. Redirecting away from guest route.');
            const returnTo = (to.query.redirect as string) || '/';
            return navigateTo(returnTo, { replace: true });
        }
    } catch (error) {
        Logger.warn('[GuestMiddleware] Error checking auth status:', error);
    }
});
