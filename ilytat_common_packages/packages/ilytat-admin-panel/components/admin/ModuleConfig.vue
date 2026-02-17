<template>
    <div class="space-y-8">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold text-white tracking-tight">Module Configuration</h2>
                <p class="text-slate-400 text-sm mt-1">Enable or disable feature modules for your organization.</p>
            </div>
            <button 
                @click="handleSave"
                :disabled="!hasChanges"
                class="px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300"
                :class="hasChanges ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20' : 'bg-white/5 text-slate-600 cursor-not-allowed'"
            >
                Save Changes
            </button>
        </div>

        <!-- Module Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="mod in allModules" :key="mod.id"
                class="relative p-5 rounded-xl border transition-all duration-300 group"
                :class="isEnabled(mod.id) 
                    ? 'bg-white/5 border-white/10 hover:border-white/20' 
                    : 'bg-black/30 border-white/5 opacity-60 hover:opacity-80'"
            >
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">{{ mod.icon }}</span>
                        <div>
                            <h3 class="text-sm font-bold text-white uppercase tracking-wider">{{ mod.name }}</h3>
                            <p class="text-xs text-slate-500 mt-0.5">{{ mod.description }}</p>
                        </div>
                    </div>

                    <!-- Toggle -->
                    <button 
                        v-if="mod.canDisable"
                        @click="toggleModule(mod.id)"
                        class="relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        :class="isEnabled(mod.id) ? 'bg-amber-500' : 'bg-white/10'"
                    >
                        <span 
                            class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300"
                            :class="isEnabled(mod.id) ? 'translate-x-5' : 'translate-x-0'"
                        />
                    </button>
                    
                    <!-- Core badge -->
                    <span v-else class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-400 border border-amber-400/30 rounded-full">
                        Core
                    </span>
                </div>

                <!-- Route indicator -->
                <div class="mt-3 text-[10px] font-mono text-slate-600">
                    {{ mod.route }}
                </div>
            </div>
        </div>

        <!-- Status message -->
        <p v-if="saveMessage" class="text-sm font-medium" :class="saveError ? 'text-red-400' : 'text-emerald-400'">
            {{ saveMessage }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useModules } from '#imports'

const { allModules, enabledModuleIds, saveModuleConfig, isModuleEnabled } = useModules()

const localEnabled = ref<string[]>([...enabledModuleIds.value])
const saveMessage = ref('')
const saveError = ref(false)

// Sync when enabledModuleIds changes (e.g., on initial load)
watch(enabledModuleIds, (ids) => {
    localEnabled.value = [...ids]
}, { immediate: true })

const isEnabled = (id: string): boolean => localEnabled.value.includes(id)

const hasChanges = computed(() => {
    if (localEnabled.value.length !== enabledModuleIds.value.length) return true
    return localEnabled.value.some(id => !enabledModuleIds.value.includes(id)) ||
           enabledModuleIds.value.some(id => !localEnabled.value.includes(id))
})

function toggleModule(id: string) {
    const mod = allModules.find(m => m.id === id)
    if (!mod?.canDisable) return
    
    if (localEnabled.value.includes(id)) {
        localEnabled.value = localEnabled.value.filter(m => m !== id)
    } else {
        localEnabled.value.push(id)
    }
}

async function handleSave() {
    try {
        saveError.value = false
        await saveModuleConfig(localEnabled.value)
        saveMessage.value = 'Module configuration saved successfully.'
        setTimeout(() => { saveMessage.value = '' }, 3000)
    } catch (err: any) {
        saveError.value = true
        saveMessage.value = err.message || 'Failed to save configuration.'
    }
}
</script>
