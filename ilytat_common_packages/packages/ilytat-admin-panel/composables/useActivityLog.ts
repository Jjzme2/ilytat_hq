import { useCurrentUser, useFirestore } from 'vuefire'
import { useActivityService } from '~/services/activity'
import type { ActivityItem } from '~/types'

export const useActivityLog = () => {
    const user = useCurrentUser()
    const db = useFirestore()
    const service = useActivityService(db)

    /**
     * Log a significant user action
     * @param action Human readable action name (e.g., "Task Completed")
     * @param module The functional area (e.g., "tasks", "finance")
     * @param metadata Optional details object
     */
    const log = async (action: string, module: string, metadata: Record<string, any> = {}) => {
        await service.log(user.value || null, action, module, metadata)
    }

    /**
     * Fetch recent activity for the current user
     * @param count Number of items to retrieve (default 20)
     */
    const fetchRecent = async (count: number = 20): Promise<ActivityItem[]> => {
        return await service.fetchRecent(user.value || null, count)
    }

    /**
     * Fetch audit logs across all users (Admin Context)
     */
    const adminFetchRecent = async (count: number = 50): Promise<ActivityItem[]> => {
        return await service.fetchAllRecent(count)
    }

    return {
        log,
        fetchRecent,
        adminFetchRecent
    }
}
