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
    const auth = useFirebaseAuth();

    // VueFire composables might return Refs or instances depending on version/context.
    // Safe unwrap: check if it has .value (isRef)
    const _db = (isRef(db) ? db.value : db) as import('firebase/firestore').Firestore;
    const _auth = (isRef(auth) ? auth.value : auth) as import('firebase/auth').Auth | undefined;

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
 * @param timeoutMs  Maximum time to wait before throwing (default 5 000 ms).
 */
export const waitForFirebaseAuth = async (
    timeoutMs = 5000,
): Promise<import('firebase/auth').Auth> => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        try {
            const auth = useFirebaseAuth();
            const unwrapped = isRef(auth) ? auth.value : auth;
            if (unwrapped) return unwrapped as import('firebase/auth').Auth;
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
