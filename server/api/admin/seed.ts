import { defineEventHandler } from 'h3';
import { runMigration } from '../../../AI/Migrations/20260210_InitialSeed';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { verifyAdminAccess, ensureAdminInitialized } from '../../utils/adminAuth';

// Initialize Firebase Admin SDK
// This runs on the server (Nitro)

export default defineEventHandler(async (event) => {
    await verifyAdminAccess(event);
    ensureAdminInitialized();

    try {
        const db = getFirestore();
        const auth = getAuth();
        const result = await runMigration(db, auth);
        return result;
    } catch (e: any) {
        return {
            success: false,
            error: e.message,
            stack: e.stack
        };
    }
});
