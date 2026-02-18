import { verifyAdminToken, ensureAdminInitialized } from '../../utils/adminAuth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
    // 1. Authenticate user
    const user = await verifyAdminToken(event);
    if (!user || !user.uid) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    // 2. Validate Input
    const body = await readBody(event);
    const { inviteId } = body;

    if (!inviteId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing inviteId' });
    }

    // 3. Initialize Firestore
    ensureAdminInitialized();
    const db = getFirestore();

    // 4. Run Transaction
    try {
        await db.runTransaction(async (t) => {
            const inviteRef = db.collection('invitations').doc(inviteId);
            const inviteDoc = await t.get(inviteRef);

            if (!inviteDoc.exists) {
                throw createError({ statusCode: 404, statusMessage: 'Invitation not found' });
            }

            const inviteData = inviteDoc.data();

            // Validate Ownership / Status
            if (inviteData?.toUserId !== user.uid) {
                throw createError({ statusCode: 403, statusMessage: 'Not your invitation' });
            }
            if (inviteData.status !== 'pending') {
                throw createError({ statusCode: 400, statusMessage: 'Invitation is not pending' });
            }

            const projectId = inviteData.projectId;
            if (!projectId) {
                throw createError({ statusCode: 500, statusMessage: 'Corrupt invitation data' });
            }

            const projectRef = db.collection('projects').doc(projectId);
            const projectDoc = await t.get(projectRef);

            if (!projectDoc.exists) {
                throw createError({ statusCode: 404, statusMessage: 'Project not found' });
            }

            // Update Project Members & Roles
            // We use arrayUnion for members and merge for roles
            const role = inviteData.role || 'viewer';
            const rolesUpdate = {
                [`roles.${user.uid}`]: role
            };

            t.update(projectRef, {
                members: FieldValue.arrayUnion(user.uid),
                ...rolesUpdate
            });

            // Update Invitation Status
            t.update(inviteRef, {
                status: 'accepted',
                acceptedAt: FieldValue.serverTimestamp()
            });
        });

        return { success: true };

    } catch (e: any) {
        console.error('Accept Invite Error:', e);
        // Rethrow proper error if it's one of ours, else 500
        if (e.statusCode) throw e;
        throw createError({ statusCode: 500, statusMessage: e.message || 'Internal Server Error' });
    }
});
