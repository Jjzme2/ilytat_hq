import { Invitation } from '~/models/Invitation';
import { InvitationStatus } from '~/schemas/InvitationSchema';
import { where, limit, updateDoc, doc } from 'firebase/firestore';
import { User } from '~/models/User';

export const useProjectInvitations = () => {
    const { user } = useUser();
    const { db } = useFirebase();

    const {
        create: createInvite,
        update: updateInvite,
        remove: removeInvite,
        getAll: getAllInvites
    } = useFirestoreRepository<Invitation>(
        'invitations',
        (data) => new Invitation(data)
    );

    const pendingInvitations = ref<Invitation[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Create an invitation
    const inviteUser = async (projectId: string, targetUserId: string, role: string = 'viewer', message?: string) => {
        if (!user.value) throw new Error('Must be logged in to invite users');

        isLoading.value = true;
        try {
            // Check project type for Personal association
            const projectRepo = useFirestoreRepository('projects');
            // Check if user has permission to invite (usually owner for personal projects)
            // We fetch the project to check its association.
            // Note: firestore rules for reading project checks membership.
            // If I am the creator/owner, I can read it.
            const projectDoc = await projectRepo.getById(projectId) as any;

            // "Users can not be added by UserID if we are on a tenant project." 
            if (projectDoc?.association !== 'personal') {
                throw new Error('Invitations by User ID are only for Personal Projects. Use Tenant assignment for company projects.');
            }

            // Check if already invited (pending)
            const existing = await getAllInvites([
                where('projectId', '==', projectId),
                where('toUserId', '==', targetUserId),
                where('status', '==', InvitationStatus.PENDING),
                limit(1)
            ]);

            if (existing.length > 0) {
                throw new Error('User already has a pending invitation to this project');
            }

            const newInvite = new Invitation({
                fromUserId: user.value.uid,
                toUserId: targetUserId,
                projectId,
                projectName: projectDoc.name || 'Untitled Project',
                status: InvitationStatus.PENDING,
                role,
                message
            });

            return await createInvite(newInvite);
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    // Get strictly my received invitations
    const fetchMyInvitations = async () => {
        if (!user.value) return;

        isLoading.value = true;
        try {
            pendingInvitations.value = await getAllInvites([
                where('toUserId', '==', user.value.uid),
                where('status', '==', InvitationStatus.PENDING)
            ]);
        } catch (e: any) {
            console.error(e);
        } finally {
            isLoading.value = false;
        }
    };

    // Accept invitation
    const acceptInvitation = async (invitationId: string) => {
        if (!user.value) return;

        isLoading.value = true;
        try {
            const { $fetch } = useNuxtApp();

            // Use server endpoint to handle secure join
            const result = await $fetch('/api/projects/accept-invite', {
                method: 'POST',
                body: { inviteId: invitationId },
                // Headers might be needed if not auto-injected. 
                // Assuming adminAuth utils handle it or we rely on session cookie if present.
                // If it fails with 401, we know we need to attach token manually using User's ID token.
                // Let's add token proactively just in case.
                headers: {
                    Authorization: `Bearer ${await user.value.getIdToken()}`
                }
            });

            // If successful, remove from local list
            pendingInvitations.value = pendingInvitations.value.filter(i => i.id !== invitationId);

            return result;
        } catch (e: any) {
            console.error(e);
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    return {
        pendingInvitations,
        isLoading,
        error,
        inviteUser,
        fetchMyInvitations,
        acceptInvitation
    };
};
