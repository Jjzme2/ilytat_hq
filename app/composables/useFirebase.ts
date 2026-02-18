/**
 * useFirebase — Thin wrapper around vuefire composables.
 *
 * WHY: nuxt-vuefire already calls initializeApp() via nuxt.config.ts.
 * Calling initializeApp() again from client code causes the
 * "default Firebase app does not exist" race-condition error.
 * This composable simply re-exports the instances vuefire manages,
 * so every consumer gets the same, guaranteed-initialized references.
 */
import { isRef } from 'vue';
import { useFirebaseApp, useFirestore, useFirebaseAuth } from 'vuefire';

export const useFirebase = () => {
    const app = useFirebaseApp();
    const db = useFirestore();
    const auth = useFirebaseAuth();

    // VueFire composables might return Refs or instances depending on version/context.
    // Safe unwrap: check if it has .value (isRef)
    const _db = isRef(db) ? db.value : db;
    const _auth = isRef(auth) ? auth.value : auth;

    return { app, db: _db, auth: _auth };
};
