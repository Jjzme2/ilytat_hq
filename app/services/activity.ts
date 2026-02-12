/**
 * services/activity.ts
 * ────────────────────
 * Firestore-backed activity logging service.
 * Used by `useActivityLog` composable from the ilytat-admin-panel layer.
 *
 * Writes to the `activity_logs` collection. Each document represents
 * a single auditable action (e.g., "User Invited", "Migration Executed").
 *
 * Intent: Centralize audit trail persistence so composables stay thin.
 */

import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    type Firestore
} from 'firebase/firestore'
import type { ActivityItem } from '~/types'
import type { User } from 'firebase/auth'

const COLLECTION_NAME = 'activity_logs'

export const useActivityService = (db: Firestore) => {

    /**
     * Log a user action to Firestore.
     * @param user - The currently authenticated user (or null for system actions)
     * @param action - Human-readable action label
     * @param module - Functional area identifier (e.g., "admin-users", "tasks")
     * @param metadata - Arbitrary context for the action
     */
    const log = async (
        user: User | null,
        action: string,
        module: string,
        metadata: Record<string, any> = {}
    ): Promise<void> => {
        try {
            await addDoc(collection(db, COLLECTION_NAME), {
                userId: user?.uid || 'SYSTEM',
                action,
                module,
                metadata,
                timestamp: serverTimestamp()
            })
        } catch (e) {
            console.error('[ActivityService] Failed to log action:', e)
        }
    }

    /**
     * Fetch recent activity for a specific user.
     * @param user - The user whose logs to retrieve
     * @param count - Max number of results (default 20)
     */
    const fetchRecent = async (user: User | null, count: number = 20): Promise<ActivityItem[]> => {
        if (!user) return []

        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                where('userId', '==', user.uid),
                orderBy('timestamp', 'desc'),
                limit(count)
            )
            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ActivityItem))
        } catch (e) {
            console.error('[ActivityService] Failed to fetch user logs:', e)
            return []
        }
    }

    /**
     * Fetch recent activity across ALL users (admin audit view).
     * @param count - Max number of results (default 50)
     */
    const fetchAllRecent = async (count: number = 50): Promise<ActivityItem[]> => {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                orderBy('timestamp', 'desc'),
                limit(count)
            )
            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ActivityItem))
        } catch (e) {
            console.error('[ActivityService] Failed to fetch all logs:', e)
            return []
        }
    }

    return { log, fetchRecent, fetchAllRecent }
}
