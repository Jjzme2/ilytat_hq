<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-primary border border-border rounded-xl shadow-2xl w-full max-w-md p-6 m-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-text-primary">Customize Dashboard</h2>
        <button @click="$emit('close')" class="text-text-tertiary hover:text-text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
      </div>

      <div v-else class="space-y-4">
        <p class="text-sm text-text-secondary mb-4">Toggle widgets on/off and drag to reorder.</p>
        
        <draggable
          v-model="localWidgets"
          item-key="id"
          handle=".customizer-drag-handle"
          ghost-class="opacity-30"
          :animation="200"
          class="space-y-2"
          @end="onReorderEnd"
        >
          <template #item="{ element }">
            <div class="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
              <!-- Drag handle -->
              <button
                class="customizer-drag-handle flex-shrink-0 text-text-tertiary hover:text-text-primary cursor-grab active:cursor-grabbing transition-colors"
                title="Drag to reorder"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
                  <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                  <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
                </svg>
              </button>

              <!-- Widget name -->
              <span class="flex-1 font-medium text-text-primary capitalize">{{ getWidgetName(element.id) }}</span>

              <!-- Toggle -->
              <button 
                @click="handleToggle(element.id, !element.enabled)"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/50 flex-shrink-0"
                :class="element.enabled ? 'bg-accent-primary' : 'bg-zinc-600'"
              >
                <span 
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="element.enabled ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>
          </template>
        </draggable>
      </div>

      <div class="mt-8 flex justify-end">
        <button 
          @click="$emit('close')"
          class="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-colors text-sm font-medium"
        >
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import draggable from 'vuedraggable';
import { useUserPreferences } from '~/composables/useUserPreferences';
import { ALL_MODULES } from '../../config/modules';
import type { DashboardWidget } from '~/models/UserPreference';

defineEmits(['close']);

const { preferences, isLoading, loadPreferences, toggleWidget, reorderWidgets } = useUserPreferences();

/**
 * Local copy of widgets for v-model binding with draggable.
 * Includes all widgets (enabled and disabled) so the user can reorder everything.
 */
const localWidgets = ref<DashboardWidget[]>([]);

// Ensure preferences are loaded
onMounted(() => {
    if (!preferences.value) {
        loadPreferences();
    }
});

const allWidgets = computed(() => {
    if (!preferences.value) return [];
    
    // Merge existing layout with any new modules from ALL_MODULES
    const existingMap = new Map(preferences.value.dashboardLayout.map(w => [w.id, w]));
    
    const merged = ALL_MODULES.map(module => {
        const existing = existingMap.get(module.id);
        if (existing) return existing;
        return { id: module.id, enabled: false, order: 999 };
    });

    return merged.sort((a, b) => a.order - b.order);
});

// Keep localWidgets in sync with preferences
watch(allWidgets, (widgets) => {
    localWidgets.value = [...widgets];
}, { immediate: true });

const getWidgetName = (id: string) => {
    const module = ALL_MODULES.find(m => m.id === id);
    return module?.name || id;
};

const handleToggle = async (id: string, enabled: boolean) => {
    await toggleWidget(id, enabled);
};

/**
 * On drag end in the customizer, persist the new order including both
 * enabled and disabled widgets so the full ordering is saved.
 */
const onReorderEnd = async () => {
    await reorderWidgets(localWidgets.value);
};
</script>
