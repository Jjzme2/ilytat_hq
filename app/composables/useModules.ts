import { Logger } from '~/utils/Logger';
/**
 * useModules — Composable for organization-level module configuration
 * 
 * Intent: Allows staff/super users to enable/disable feature modules
 * per organization. Each org has a config doc at tenants/{orgId}/config/modules
 * that stores which modules are active.
 * 
 * Default modules: finance, documents, inbox, schedule, projects, themes
 * All modules are enabled by default if no config exists.
 */
import { ref, computed, watch } from 'vue'
import { useCurrentUser } from 'vuefire'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ALL_MODULES, isPlanSufficient, type ModuleDefinition } from '../config/modules'

export type { ModuleDefinition }

export const useModules = () => {
    const user = useCurrentUser()
    const { db } = useFirebase()
    const { organization } = useOrganization()
    const enabledModuleIds = ref<string[]>(ALL_MODULES.map(m => m.id))
    const isLoading = ref(true)

    // Fetch module config for the user's tenant
    const loadModuleConfig = async () => {
        if (!user.value) return

        try {
            const tokenResult = await user.value.getIdTokenResult()
            const orgId = (tokenResult.claims.tenantId as string) || (tokenResult.claims.organizationId as string) || null

            if (!orgId) {
                // No organization — all modules enabled
                enabledModuleIds.value = ALL_MODULES.map(m => m.id)
                isLoading.value = false
                return
            }

            if (!db) {
                Logger.warn('[useModules] Firestore not initialized')
                enabledModuleIds.value = ALL_MODULES.map(m => m.id)
                isLoading.value = false
                return
            }

            const configRef = doc(db, 'tenants', orgId, 'config', 'modules')
            const snap = await getDoc(configRef)

            if (snap.exists()) {
                const data = snap.data()
                enabledModuleIds.value = data.enabled || ALL_MODULES.map(m => m.id)
            } else {
                // No config yet — all enabled by default
                enabledModuleIds.value = ALL_MODULES.map(m => m.id)
            }
        } catch (err) {
            Logger.error('[useModules] Failed to load module config:', err)
            enabledModuleIds.value = ALL_MODULES.map(m => m.id)
        } finally {
            isLoading.value = false
        }
    }

    // Save module config (staff/super only)
    const saveModuleConfig = async (moduleIds: string[]) => {
        if (!user.value || !db) return

        const tokenResult = await user.value.getIdTokenResult()
        const orgId = (tokenResult.claims.tenantId as string) || (tokenResult.claims.organizationId as string) || null
        const roles = (tokenResult.claims.roles as string[]) || []

        if (!orgId) return
        if (!roles.includes('staff') && !roles.includes('super') && !roles.includes('admin')) {
            throw new Error('Insufficient permissions to modify module config')
        }

        // Ensure core modules are always enabled
        const coreIds = ALL_MODULES.filter(m => !m.canDisable).map(m => m.id)
        const finalIds = [...new Set([...coreIds, ...moduleIds])]

        const configRef = doc(db, 'tenants', orgId, 'config', 'modules')
        await setDoc(configRef, { enabled: finalIds, updatedAt: new Date() }, { merge: true })
        enabledModuleIds.value = finalIds
    }

    const isModuleEnabled = (moduleId: string): boolean => {
        // Check if module is in the enabled list
        const isEnabled = enabledModuleIds.value.includes(moduleId)
        if (!isEnabled) return false

        // Check plan tier gating
        const moduleDef = ALL_MODULES.find(m => m.id === moduleId)
        if (moduleDef?.requiredPlan) {
            const userPlan = (organization.value as any)?.plan || 'free'
            return isPlanSufficient(userPlan, moduleDef.requiredPlan)
        }

        return true
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
