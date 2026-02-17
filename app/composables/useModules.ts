/**
 * useModules — Composable for tenant-level module configuration
 * 
 * Intent: Allows staff/super users to enable/disable feature modules
 * per tenant. Each tenant has a config doc at tenants/{tenantId}/config/modules
 * that stores which modules are active.
 * 
 * Default modules: finance, documents, inbox, schedule, projects, themes
 * All modules are enabled by default if no config exists.
 */
import { ref, computed, watch } from 'vue'
import { useCurrentUser, useFirestore } from 'vuefire'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export interface ModuleDefinition {
    id: string
    name: string
    description: string
    icon: string
    route: string
    /** Whether this module can be disabled (core modules cannot) */
    canDisable: boolean
}

const ALL_MODULES: ModuleDefinition[] = [
    { id: 'projects', name: 'Projects', description: 'Project management and collaboration', icon: '📁', route: '/projects', canDisable: false },
    { id: 'inbox', name: 'Inbox', description: 'Messages and notifications', icon: '📥', route: '/inbox', canDisable: true },
    { id: 'schedule', name: 'Schedule', description: 'Calendar and event management', icon: '📅', route: '/schedule', canDisable: true },
    { id: 'documents', name: 'Documents', description: 'Document creation and templates', icon: '📄', route: '/documents', canDisable: true },
    { id: 'finance', name: 'Finance', description: 'Financial tracking, budgets, and accounts', icon: '💰', route: '/finance', canDisable: true },
    { id: 'themes', name: 'Themes', description: 'Theme gallery and customization', icon: '🎨', route: '/themes', canDisable: true },
]

export const useModules = () => {
    const user = useCurrentUser()
    const db = useFirestore()
    const enabledModuleIds = ref<string[]>(ALL_MODULES.map(m => m.id))
    const isLoading = ref(true)

    // Fetch module config for the user's tenant
    const loadModuleConfig = async () => {
        if (!user.value) return

        try {
            const tokenResult = await user.value.getIdTokenResult()
            const tenantId = (tokenResult.claims.tenantId as string) || null

            if (!tenantId) {
                // No tenant — all modules enabled
                enabledModuleIds.value = ALL_MODULES.map(m => m.id)
                isLoading.value = false
                return
            }

            const configRef = doc(db, 'tenants', tenantId, 'config', 'modules')
            const snap = await getDoc(configRef)

            if (snap.exists()) {
                const data = snap.data()
                enabledModuleIds.value = data.enabled || ALL_MODULES.map(m => m.id)
            } else {
                // No config yet — all enabled by default
                enabledModuleIds.value = ALL_MODULES.map(m => m.id)
            }
        } catch (err) {
            console.error('[useModules] Failed to load module config:', err)
            enabledModuleIds.value = ALL_MODULES.map(m => m.id)
        } finally {
            isLoading.value = false
        }
    }

    // Save module config (staff/super only)
    const saveModuleConfig = async (moduleIds: string[]) => {
        if (!user.value) return

        const tokenResult = await user.value.getIdTokenResult()
        const tenantId = (tokenResult.claims.tenantId as string) || null
        const roles = (tokenResult.claims.roles as string[]) || []

        if (!tenantId) return
        if (!roles.includes('staff') && !roles.includes('super') && !roles.includes('admin')) {
            throw new Error('Insufficient permissions to modify module config')
        }

        // Ensure core modules are always enabled
        const coreIds = ALL_MODULES.filter(m => !m.canDisable).map(m => m.id)
        const finalIds = [...new Set([...coreIds, ...moduleIds])]

        const configRef = doc(db, 'tenants', tenantId, 'config', 'modules')
        await setDoc(configRef, { enabled: finalIds, updatedAt: new Date() }, { merge: true })
        enabledModuleIds.value = finalIds
    }

    const isModuleEnabled = (moduleId: string): boolean => {
        return enabledModuleIds.value.includes(moduleId)
    }

    const enabledModules = computed(() => {
        return ALL_MODULES.filter(m => enabledModuleIds.value.includes(m.id))
    })

    const disabledModules = computed(() => {
        return ALL_MODULES.filter(m => !enabledModuleIds.value.includes(m.id))
    })

    // Auto-load when user is available
    watch(user, (u) => {
        if (u) loadModuleConfig()
    }, { immediate: true })

    return {
        allModules: ALL_MODULES,
        enabledModuleIds,
        enabledModules,
        disabledModules,
        isModuleEnabled,
        saveModuleConfig,
        isLoading,
        loadModuleConfig
    }
}
