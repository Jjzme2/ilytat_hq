/**
 * firebase.client.ts — Client-side Firebase lifecycle plugin.
 *
 * Responsibilities:
 *  1. Seed the reactive state from useFirebaseLifecycle()
 *  2. Register browser-level event listeners (online/offline, visibility)
 *  3. Register Firebase onAuthStateChanged listener
 *  4. Monitor Firestore connectivity via onSnapshot on a sentinel doc
 *
 * WHY a plugin?  We need exactly-once registration of event listeners
 * that persist for the entire client session. Nuxt plugins run once on
 * hydration, making them the ideal place for this setup.
 */
import { onAuthStateChanged } from 'firebase/auth';
import { Logger } from '~/utils/Logger';
import {
    doc,
    onSnapshot,
    type Unsubscribe,
} from 'firebase/firestore';
import { useFirestore } from 'vuefire';

export default defineNuxtPlugin(async (nuxtApp) => {
    // Wait for nuxt-vuefire to finish initialising the Firebase app.
    // On the first cold production load this may take a few ticks.
    const auth = await waitForFirebaseAuth();
    const db = useFirestore();

    // Lifecycle state — shared via useState under the hood
    const {
        isAuthenticated,
        lastAuthEvent,
        isOnline,
        lastOnlineAt,
        lastOfflineAt,
        isFirestoreConnected,
        isAppVisible,
    } = useFirebaseLifecycle();

    // --------------------------------------------------------------------------
    // 1. Auth state listener
    // --------------------------------------------------------------------------
    const unsubAuth = onAuthStateChanged(auth, (user) => {
        if (user) {
            isAuthenticated.value = true;
            lastAuthEvent.value = 'signed-in';
            Logger.debug('[Firebase Lifecycle] Auth state → signed-in');
            startFirestoreHealthCheck();
        } else {
            isAuthenticated.value = false;
            lastAuthEvent.value = 'signed-out';
            Logger.debug('[Firebase Lifecycle] Auth state → signed-out');
            stopFirestoreHealthCheck();
        }
    });

    // --------------------------------------------------------------------------
    // 2. Network connectivity (browser-level)
    // --------------------------------------------------------------------------
    const handleOnline = () => {
        isOnline.value = true;
        lastOnlineAt.value = new Date();
    };

    const handleOffline = () => {
        isOnline.value = false;
        lastOfflineAt.value = new Date();
        isFirestoreConnected.value = false;
    };

    // Seed with current state
    isOnline.value = navigator.onLine;

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // --------------------------------------------------------------------------
    // 3. Firestore connection health
    //    Deferred until authenticated — Firestore rules require auth for reads.
    //    Uses a lightweight onSnapshot with { includeMetadataChanges: true } to
    //    detect when the SDK flips between "from cache" and "from server".
    // --------------------------------------------------------------------------
    let unsubFirestore: Unsubscribe | null = null;

    /**
     * Start a lightweight Firestore snapshot listener on a sentinel doc.
     * Called only after successful auth to avoid permission errors.
     */
    const startFirestoreHealthCheck = () => {
        // Tear down any existing listener first
        unsubFirestore?.();

        try {
            const sentinelRef = doc(db, '_lifecycle_ping', 'status');
            unsubFirestore = onSnapshot(
                sentinelRef,
                { includeMetadataChanges: true },
                (snapshot) => {
                    const connected = !snapshot.metadata.fromCache;
                    if (isFirestoreConnected.value !== connected) {
                        isFirestoreConnected.value = connected;
                    }
                },
                () => {
                    // Permission denied or doc doesn't exist — fall back to network status.
                    isFirestoreConnected.value = isOnline.value;
                }
            );
        } catch {
            isFirestoreConnected.value = isOnline.value;
        }
    };

    const stopFirestoreHealthCheck = () => {
        unsubFirestore?.();
        unsubFirestore = null;
    };

    // --------------------------------------------------------------------------
    // 4. App / tab visibility
    // --------------------------------------------------------------------------
    const handleVisibilityChange = () => {
        isAppVisible.value = document.visibilityState === 'visible';
    };

    isAppVisible.value = document.visibilityState === 'visible';
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // --------------------------------------------------------------------------
    // 5. Cleanup on app teardown (SSR/hot-reload safety)
    // --------------------------------------------------------------------------
    const handleBeforeUnload = () => { /* cleanup handled by app:unmount */ };

    window.addEventListener('beforeunload', handleBeforeUnload);





    nuxtApp.hook('app:error', (error) => {
        Logger.error('[Firebase Lifecycle] App error caught:', error);
    });

    // Cleanup when the Vue app instance is unmounted (HMR / navigation away)
    nuxtApp.hook('app:unmount' as any, () => {
        unsubAuth();
        unsubFirestore?.();
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    });
});
