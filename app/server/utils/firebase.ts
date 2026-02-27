/**
 * server/utils/firebase.ts
 * ────────────────────────
 * Provides a lazily-initialized Firestore Admin instance.
 *
 * WHY lazy? The previous top-level call to ensureAdminInitialized() could
 * crash at import time if nuxt-vuefire hadn't created the [DEFAULT] app yet,
 * causing a 500 "Firebase app does not exist" on every server route.
 * Lazy initialization defers the call until the first actual Firestore access.
 */
import { getFirestore } from 'firebase-admin/firestore';
import { ensureAdminInitialized } from './adminAuth';

let _firestore: ReturnType<typeof getFirestore> | null = null;

/**
 * Returns a lazily-initialized Firestore Admin instance.
 * Safe to call at any point — will initialize the admin app on first use.
 */
export const getAdminFirestore = () => {
    if (!_firestore) {
        const app = ensureAdminInitialized();
        _firestore = getFirestore(app);
    }
    return _firestore;
};

/**
 * Backward-compatible `firestore` export.
 * Proxies all property access through getAdminFirestore() so existing
 * imports like `import { firestore } from '~/server/utils/firebase'`
 * continue to work without changes.
 *
 * @deprecated Prefer getAdminFirestore() for clarity.
 */
export const firestore = new Proxy({} as ReturnType<typeof getFirestore>, {
    get(_, prop) {
        return (getAdminFirestore() as any)[prop];
    },
});
