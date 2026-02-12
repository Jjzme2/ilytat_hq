/**
 * useFirebaseLifecycle — Reactive lifecycle state for Firebase services.
 *
 * Exposes globally-shared refs for:
 *  • Auth state (isAuthenticated, lastAuthEvent)
 *  • Network connectivity (isOnline, lastOnlineAt, lastOfflineAt)
 *  • Firestore connection health (isFirestoreConnected)
 *  • Tab / app visibility (isAppVisible)
 *
 * State is initialised once by the firebase.client.ts plugin and then
 * consumed reactively by any component or composable that calls this hook.
 *
 * 12-Month Rule: A year from now you will want to know —
 *   "Where do these refs come from?" → They are seeded by the Nuxt
 *   plugin (firebase.client.ts) which calls _initLifecycle(). The
 *   composable itself only *reads* the shared useState refs so that
 *   multiple callers never duplicate event listeners.
 */

/** Reactive state exposed to consumers */
export const useFirebaseLifecycle = () => {
    // --- Auth ------------------------------------------------------------------
    const isAuthenticated = useState<boolean>('fb-lc-authenticated', () => false);
    const lastAuthEvent = useState<string>('fb-lc-last-auth-event', () => 'unknown');

    // --- Network ---------------------------------------------------------------
    const isOnline = useState<boolean>('fb-lc-online', () => true);
    const lastOnlineAt = useState<Date | null>('fb-lc-last-online', () => null);
    const lastOfflineAt = useState<Date | null>('fb-lc-last-offline', () => null);

    // --- Firestore connection --------------------------------------------------
    const isFirestoreConnected = useState<boolean>('fb-lc-firestore-connected', () => true);

    // --- App visibility --------------------------------------------------------
    const isAppVisible = useState<boolean>('fb-lc-app-visible', () => true);

    return {
        isAuthenticated,
        lastAuthEvent,
        isOnline,
        lastOnlineAt,
        lastOfflineAt,
        isFirestoreConnected,
        isAppVisible,
    };
};
