import { doc } from 'firebase/firestore';
import { useFirestore, useDocument, useCurrentUser } from 'vuefire';
import { useUser } from './useUser';

/**
 * useOrganization Composable (formerly useTenant)
 *
 * Reads the organization (guild/startup) document for the current user.
 * The organizationId is sourced from the user's profile document.
 * Maps to the `tenants` Firestore collection (kept for data continuity).
 */
export const useOrganization = () => {
    const db = useFirestore();
    const firebaseUser = useCurrentUser();
    const { user } = useUser();

    // Derive organizationId from user profile (supports old tenantId field from DB)
    const organizationId = computed(() => user.value?.organizationId || (user.value as any)?.tenantId || '');

    // Reactive organization document — only query when we have auth + organizationId
    const orgDocRef = computed(() => {
        if (firebaseUser.value && organizationId.value) {
            return doc(db, 'tenants', organizationId.value);
        }
        return null as any;
    });

    const { data: organization, pending: organizationPending } = useDocument(orgDocRef);

    const isOrgMember = computed(() => !!organizationId.value);

    // Legacy aliases for backward compatibility during migration
    const tenantId = organizationId;
    const tenant = organization;

    return {
        organizationId,
        organization,
        organizationPending,
        isOrgMember,
        // Legacy aliases
        tenantId,
        tenant
    };
};

