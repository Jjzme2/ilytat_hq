/**
 * useFirebase — Thin wrapper around vuefire composables.
 *
 * WHY: nuxt-vuefire already calls initializeApp() via nuxt.config.ts.
 * Calling initializeApp() again from client code causes the
 * "default Firebase app does not exist" race-condition error.
 * This composable simply re-exports the instances vuefire manages,
 * so every consumer gets the same, guaranteed-initialized references.
 */
import { useFirebaseApp, useFirestore, useFirebaseAuth } from 'vuefire';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';


export const useFirebase = (): { app: FirebaseApp | undefined; db: Firestore | undefined; auth: Auth | undefined } => {
    const app = useFirebaseApp();
    const db = app.value ? useFirestore() : undefined;
    const auth = useFirebaseAuth();

    return { app: app.value, db: db?.value || db, auth: auth?.value || auth };
};
