import type { AdminAdapter, AdminStat, AdminUser, AdminProject, SystemServiceStatus } from '@admin/types/AdminAdapter'
import { useNuxtApp } from '#app'
import { collection, query, where, getDocs, getCountFromServer, orderBy, limit, addDoc, updateDoc, doc, deleteDoc, collectionGroup, serverTimestamp } from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'

export class FirebaseAdminAdapter implements AdminAdapter {
    private db = useFirestore()

    // --- Dashboard ---
    async getDashboardStats(): Promise<AdminStat[]> {
        try {
            const { useUser } = await import('~/composables/useUser')
            const { user } = useUser()
            // Ensure we have a tenant context
            const tenantId = user.value?.tenantId || 'system'

            // Queries must filter by tenantId to satisfy security rules
            // 1. Users: This might be tricky if users collection is root and rules require auth.uid == userId.
            //    Actually, users are public (read-only) forauth users in current rules? 
            //    Let's check rules: match /users/{userId} { allow read: if isAuth(); }
            //    So counting users *should* work if list permissions are open. 
            //    BUT wait, list permissions might not be open for the whole collection if rules are default secure.
            //    Actually, `allow read: if isAuth()` on `/users/{userId}` allows reading single docs. 
            //    It does NOT necessarily allow listing the collection unless the rule is on `/users`.
            //    The rule IS `match /users/{userId}`. This usually implies list is allowed if `isAuth()` is true for "a document"?
            //    No, for `list` (which `getCountFromServer` uses), the rule must evaluate to true for *potential* results.
            //    If the rule is `allow read: if isAuth()`, then yes, any auth user can list users.
            //    HOWEVER, for `tasks` and `activity_logs`, we likely have strict rules.

            // Let's assume we need to filter by tenant for everything that IS tenant-scoped.
            // Users might not have `tenantId` on them reliably or we want to count *tenant* users.
            // Start with try/catch blocks or just filter where possible.

            const [usersSnapshot, tasksSnapshot, logsSnapshot] = await Promise.all([
                // For users, we probably only want to count users in THIS tenant.
                // Assuming users have a 'tenantId' field.
                getCountFromServer(query(collection(this.db, 'users'), where('tenantId', '==', tenantId))),

                // Tasks are likely under projects now or have tenantId if they are root/group queried.
                // If they are collectionGroup, we MUST filter by tenantId if rules require `resource.data.tenantId == user.tenantId`.
                getCountFromServer(query(collectionGroup(this.db, 'tasks'), where('tenantId', '==', tenantId), where('status', '!=', 'completed'))),

                // Logs
                getCountFromServer(query(collection(this.db, 'activity_logs'), where('tenantId', '==', tenantId)))
            ])

            return [
                { label: 'Total Users', value: usersSnapshot.data().count, trend: 0 },
                { label: 'Active Tasks', value: tasksSnapshot.data().count, trend: 0 },
                { label: 'Audit Events', value: logsSnapshot.data().count, trend: 0 },
                { label: 'System Uptime', value: '99.9%', trend: 0 }
            ]
        } catch (e) {
            console.error('Failed to fetch stats', e)
            return []
        }
    }

    async getSystemHealth(): Promise<SystemServiceStatus[]> {
        // Mocked real-world check for now, can perform actual pings
        const dbStatus = 'online'
        try {
            await getDocs(query(collection(this.db, '_lifecycle_ping'), limit(1)))
        } catch {
            return [{ name: 'Database Cluster', status: 'offline' }]
        }

        return [
            { name: 'Core API Server', status: 'online', latency: '24ms' },
            { name: 'Database Cluster', status: dbStatus, latency: '12ms' },
            { name: 'Storage Bucket', status: 'online' },
            { name: 'Auth Gateway', status: 'online' }
        ]
    }

    // --- Users ---
    async getUsers(): Promise<AdminUser[]> {
        // In a real app with thousands of users, this should be paginated or use a callable function
        // For this implementation, we'll try to fetch from the 'users' collection or call an API
        try {
            const token = await (await useCurrentUser().value?.getIdToken())
            if (!token) throw new Error("Unauthorized")

            // Re-using existing API defined in AdminUsers.vue logic
            const users = await $fetch<AdminUser[]>('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            })
            return users
        } catch (e) {
            console.error(e)
            return []
        }
    }

    async inviteUser(email: string, role: string): Promise<void> {
        const token = await (await useCurrentUser().value?.getIdToken())
        await $fetch('/api/admin/invite', {
            method: 'POST',
            body: { email, role },
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    async updateUserStatus(uid: string, disabled: boolean): Promise<void> {
        const token = await (await useCurrentUser().value?.getIdToken())
        await $fetch('/api/admin/user-status', {
            method: 'POST',
            body: { uid, disabled },
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    async resetUserPassword(uid: string): Promise<string | void> {
        const token = await (await useCurrentUser().value?.getIdToken())
        const result = await $fetch<{ success: boolean, link?: string }>('/api/admin/user-action', {
            method: 'POST',
            body: { uid, action: 'send-reset-email' },
            headers: { Authorization: `Bearer ${token}` }
        })
        return result.link
    }

    async assignUserToTenant(uid: string, tenantId: string): Promise<void> {
        const token = await (await useCurrentUser().value?.getIdToken())
        await $fetch('/api/admin/user-action', {
            method: 'POST',
            body: { uid, action: 'assign-tenant', tenantId },
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    async sendMessage(uid: string, message: string): Promise<void> {
        const token = await (await useCurrentUser().value?.getIdToken())
        await $fetch('/api/admin/message', {
            method: 'POST',
            body: { uid, message },
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    async updateUser(uid: string, data: Partial<AdminUser>): Promise<void> {
        const token = await (await useCurrentUser().value?.getIdToken())
        await $fetch('/api/admin/user-action', {
            method: 'POST',
            body: { uid, action: 'update-user', ...data },
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    // --- Projects ---
    async getProjects(): Promise<AdminProject[]> {
        // Query root 'projects' collection, filtered by the current user's tenantId
        // This is required because security rules enforce tenantId checks, and rules are not filters.
        try {
            const { useUser } = await import('~/composables/useUser')
            const { user } = useUser()
            // Ensure user state is initialized/avail
            const tenantId = user.value?.tenantId

            if (!tenantId) {
                console.warn("getProjects: No tenantId found for user. Returning empty list.")
                return []
            }

            const q = query(
                collection(this.db, 'projects'),
                where('tenantId', '==', tenantId),
                orderBy('createdAt', 'desc')
            )

            const snapshot = await getDocs(q)
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AdminProject))
        } catch (e) {
            console.error("Failed to getProjects", e)
            throw e
        }
    }

    async createProject(data: Omit<AdminProject, 'id' | 'createdAt'>): Promise<void> {
        const { useUser } = await import('~/composables/useUser')
        const { user } = useUser()
        const tenantId = user.value?.tenantId || data.tenantId

        if (!tenantId) {
            console.error("Cannot create project without tenantId")
            throw new Error("Tenant ID is required to create a project.")
        }

        await addDoc(collection(this.db, 'projects'), {
            ...data,
            tenantId,
            createdAt: serverTimestamp(),
            members: data.members || []
        })
    }

    async updateProject(id: string, data: Partial<AdminProject>): Promise<void> {
        const docRef = doc(this.db, 'projects', id)
        await updateDoc(docRef, data)
    }

    async deleteProject(id: string): Promise<void> {
        const docRef = doc(this.db, 'projects', id)
        await deleteDoc(docRef)
    }

    // --- Activity ---
    async getActivityLogs(limitCount = 20): Promise<any[]> {
        const { useUser } = await import('~/composables/useUser')
        const { user } = useUser()
        const tenantId = user.value?.tenantId || 'system'

        const q = query(
            collection(this.db, 'activity_logs'),
            where('tenantId', '==', tenantId),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(d => d.data())
    }
}
