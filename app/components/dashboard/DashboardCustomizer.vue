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
        <p class="text-sm text-text-secondary mb-4">Select which widgets to display on your dashboard.</p>
        
        <div class="space-y-2">
          <div v-for="widget in availableWidgets" :key="widget.id" class="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
            <span class="font-medium text-text-primary capitalize">{{ getWidgetName(widget.id) }}</span>
            <button 
              @click="handleToggle(widget.id, !widget.enabled)"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
              :class="widget.enabled ? 'bg-accent-primary' : 'bg-zinc-600'"
            >
              <span 
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="widget.enabled ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>
        </div>
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
import { computed, onMounted } from 'vue';
import { useUserPreferences } from '~/composables/useUserPreferences';
import { ALL_MODULES } from '../../config/modules';

defineEmits(['close']);

const { preferences, isLoading, loadPreferences, toggleWidget } = useUserPreferences();

// Ensure preferences are loaded
onMounted(() => {
    if (!preferences.value) {
        loadPreferences();
    }
});

const availableWidgets = computed(() => {
    if (!preferences.value) return [];
    
    // Create a map of existing widgets for O(1) lookup
    const existingWidgetsMap = new Map(preferences.value.dashboardLayout.map(w => [w.id, w]));
    
    // Merge existing layout with any new modules from ALL_MODULES
    const mergedWidgets = ALL_MODULES.map(module => {
        const existing = existingWidgetsMap.get(module.id);
        if (existing) return existing;
        
        // New module not in preferences yet
        return {
            id: module.id,
            enabled: false,
            order: 999 // Put at end
        };
    });

    return mergedWidgets.sort((a, b) => a.order - b.order);
});

const getWidgetName = (id: string) => {
    const module = ALL_MODULES.find(m => m.id === id);
    return module?.name || id;
};

const handleToggle = async (id: string, enabled: boolean) => {
    await toggleWidget(id, enabled);
};
</script>
