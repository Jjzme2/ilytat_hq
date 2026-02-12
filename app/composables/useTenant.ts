import { doc } from 'firebase/firestore';
import { useFirestore, useDocument, useCurrentUser } from 'vuefire';
import { useUser } from './useUser';

/**
 * useTenant Composable
 *
 * Reads the tenant (company) document for the currently authenticated user.
 * The tenantId is sourced from the user's profile document.
 * Maps to the `tenants` Firestore collection.
 */
export const useTenant = () => {
    const db = useFirestore();
    const firebaseUser = useCurrentUser();
    const { user } = useUser();

    // Derive tenantId from user profile
    const tenantId = computed(() => user.value?.tenantId || '');

    // Reactive tenant document — only query when we have auth + tenantId
    const tenantDocRef = computed(() => {
        if (firebaseUser.value && tenantId.value) {
            return doc(db, 'tenants', tenantId.value);
        }
        return null as any;
    });

    const { data: tenant, pending: tenantPending } = useDocument(tenantDocRef);

    const isTenantMember = computed(() => !!tenantId.value);

    return {
        tenantId,
        tenant,
        tenantPending,
        isTenantMember
    };
};
