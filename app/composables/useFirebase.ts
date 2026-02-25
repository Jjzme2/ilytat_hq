/**
 * useFirebase — Thin wrapper around vuefire composables.
 *
 * WHY: nuxt-vuefire already calls initializeApp() via nuxt.config.ts.
 * Calling initializeApp() again from client code causes the
 * "default Firebase app does not exist" race-condition error.
 * This composable simply re-exports the instances vuefire manages,
 * so every consumer gets the same, guaranteed-initialized references.
 *
 * EDGE CASE: On the very first production cold-load, vuefire may not
 * have finished initialising the app when a plugin or composable runs.
 * useFirebaseAuth() will return undefined in that narrow window.
 * Code that relies on auth MUST use waitForFirebaseAuth() instead of
 * accessing auth directly from this composable.
 */
import { isRef } from 'vue';
import { useFirebaseApp, useFirestore, useFirebaseAuth } from 'vuefire';

export const useFirebase = () => {
    const app = useFirebaseApp();
    const db = useFirestore();

    // useFirebaseAuth() can return undefined on the very first cold load
    // before nuxt-vuefire has initialized the app. We catch + return null
    // so callers don't crash. Any code that needs auth MUST either check
    // for null or use waitForFirebaseAuth() instead.
    let _auth: import('firebase/auth').Auth | null = null;
    try {
        const rawAuth = useFirebaseAuth();
        _auth = (isRef(rawAuth) ? rawAuth.value : rawAuth) as import('firebase/auth').Auth | null;
    } catch {
        // VueFire not ready yet — _auth stays null
    }

    // VueFire composables might return Refs or instances depending on version/context.
    const _db = (isRef(db) ? db.value : db) as import('firebase/firestore').Firestore;

    return { app, db: _db, auth: _auth! };
};

/**
 * waitForFirebaseAuth — Async helper that polls until the VueFire-managed
 * Firebase Auth instance is available.
 *
 * WHY: On the first cold load in production, nuxt-vuefire may not have
 * called initializeApp() yet when early plugins and composables execute.
 * This helper retries with a short interval so callers can `await` auth
 * readiness without crashing.
 *
 * IMPORTANT: We use Firebase SDK's direct getApp()/getAuth() instead of
 * VueFire composables (useFirebaseAuth) because those composables rely
 * on Vue's inject() — which only works in setup context. Inside a
 * setTimeout callback the injection context is lost and the composable
 * would always return undefined.
 *
 * @param timeoutMs  Maximum time to wait before throwing (default 5 000 ms).
 */
export const waitForFirebaseAuth = async (
    timeoutMs = 5000,
): Promise<import('firebase/auth').Auth> => {
    // Direct SDK imports — context-free, safe inside any async callback.
    const { getApp } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');

    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        try {
            const app = getApp();       // throws if initializeApp() hasn't run yet
            return getAuth(app);        // guaranteed valid once app exists
        } catch {
            /* App not ready yet — keep polling */
        }
        await new Promise((r) => setTimeout(r, 50));
    }
    throw new Error(
        '[useFirebase] Firebase Auth not available after timeout. ' +
        'Verify nuxt-vuefire config and that initializeApp() runs before plugins.',
    );
};
