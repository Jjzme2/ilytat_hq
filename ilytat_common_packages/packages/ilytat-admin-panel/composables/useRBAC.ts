import { collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { useFirestore } from 'vuefire'

export interface Permission {
    id: string
    name: string
    description: string
    resource: string
    action: string
}

export interface Role {
    id: string
    name: string
    description: string
    permissions: string[] // Array of Permission IDs
}

export const useRBAC = () => {
    const db = useFirestore()

    const roles = ref<Role[]>([])
    const permissions = ref<Permission[]>([])
    const loading = ref(false)

    // --- Permissions ---

    const fetchPermissions = async () => {
        loading.value = true
        try {
            const q = query(collection(db, 'permissions'), orderBy('resource'))
            const snapshot = await getDocs(q)
            permissions.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Permission))
        } catch (e) {
            console.error('Error fetching permissions:', e)
        } finally {
            loading.value = false
        }
    }

    const createPermission = async (perm: Permission) => {
        const id = `${perm.resource}-${perm.action}`.toLowerCase()
        await setDoc(doc(db, 'permissions', id), {
            ...perm,
            id,
            createdAt: serverTimestamp()
        })
        await fetchPermissions() // Refresh
    }

    const deletePermission = async (id: string) => {
        await deleteDoc(doc(db, 'permissions', id))
        await fetchPermissions()
    }

    // --- Roles ---

    const fetchRoles = async () => {
        loading.value = true
        try {
            const q = query(collection(db, 'roles'), orderBy('name'))
            const snapshot = await getDocs(q)
            roles.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Role))
        } catch (e) {
            console.error('Error fetching roles:', e)
        } finally {
            loading.value = false
        }
    }

    const createRole = async (role: Role) => {
        // Use name as ID if not provided, sanitized
        const id = role.id || role.name.toLowerCase().replace(/\s+/g, '-')
        await setDoc(doc(db, 'roles', id), {
            ...role,
            id,
            createdAt: serverTimestamp()
        })
        await fetchRoles()
    }

    const updateRole = async (id: string, data: Partial<Role>) => {
        await setDoc(doc(db, 'roles', id), data, { merge: true })
        await fetchRoles()
    }

    const deleteRole = async (id: string) => {
        await deleteDoc(doc(db, 'roles', id))
        await fetchRoles()
    }

    return {
        roles,
        permissions,
        loading,
        fetchRoles,
        createRole,
        updateRole,
        deleteRole,
        fetchPermissions,
        createPermission,
        deletePermission
    }
}
