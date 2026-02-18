<template>
  <div class="space-y-4 md:space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-text-primary">Digital Office</h1>
        <p class="text-text-secondary mt-1">Welcome back, Operator.</p>
      </div>
      <div class="flex gap-3 w-full md:w-auto">
        <button @click="showCustomizer = true"
          class="w-full md:w-auto px-4 py-2.5 md:py-2 bg-secondary text-text-primary border border-border rounded-lg hover:bg-secondary/80 transition-colors shadow-sm text-sm font-medium flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Customize
        </button>
        <button @click="openCommandPalette"
          class="w-full md:w-auto px-4 py-2.5 md:py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-colors shadow-lg shadow-accent-primary/20 text-sm font-medium">
          Quick Action
        </button>
      </div>
    </div>

    <!-- Responsive Draggable Grid -->
    <template v-if="isLoading">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        <div v-for="i in 3" :key="i" class="bg-zinc-900/40 border border-white/5 rounded-xl p-6 h-64">
          <SkeletonLoader width="150px" height="24px" class="mb-4" />
          <SkeletonLoader width="100%" height="100%" />
        </div>
      </div>
    </template>

    <draggable
      v-else-if="localWidgets.length > 0"
      v-model="localWidgets"
      item-key="id"
      handle=".drag-handle"
      ghost-class="opacity-30"
      :animation="200"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <div class="relative group">
          <!-- Drag Handle -->
          <button
            class="drag-handle absolute top-3 right-3 z-10 p-1.5 rounded-md
                   bg-white/5 text-text-tertiary opacity-0 group-hover:opacity-100
                   hover:bg-white/10 hover:text-text-primary cursor-grab active:cursor-grabbing
                   transition-all duration-200"
            title="Drag to reorder"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
              <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
            </svg>
          </button>
          <component :is="getWidgetComponent(element.id)" v-if="getWidgetComponent(element.id)" />
        </div>
      </template>
    </draggable>

    <div v-else class="col-span-full py-12 text-center text-zinc-500">
      <p>No widgets enabled. Click "Customize" to add some.</p>
    </div>

    <!-- Customizer Modal -->
    <DashboardCustomizer v-if="showCustomizer" @close="showCustomizer = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import draggable from 'vuedraggable';
import { useCommandPalette } from '#imports';
import { useUserPreferences } from '~/composables/useUserPreferences';
import { WIDGET_REGISTRY } from '~/components/dashboard/registry';
import DashboardCustomizer from '~/components/dashboard/DashboardCustomizer.vue';
import SkeletonLoader from '~/components/ui/SkeletonLoader.vue';
import type { DashboardWidget } from '~/models/UserPreference';

definePageMeta({
  middleware: ['auth']
});

const { open: openCommandPalette } = useCommandPalette();
const { preferences, loadPreferences, reorderWidgets } = useUserPreferences();
const showCustomizer = ref(false);
const isLoading = ref(true);

/**
 * Local copy of enabled widgets for v-model binding with draggable.
 * Synced from preferences and written back on drag end.
 */
const localWidgets = ref<DashboardWidget[]>([]);

const enabledWidgets = computed(() => {
  if (!preferences.value) return [];
  return preferences.value.dashboardLayout
    .filter(w => w.enabled)
    .sort((a, b) => a.order - b.order);
});

// Keep localWidgets in sync with preferences
watch(enabledWidgets, (widgets) => {
  localWidgets.value = [...widgets];
}, { immediate: true });

const getWidgetComponent = (id: string) => {
  return WIDGET_REGISTRY[id] || null;
};

/**
 * On drag end, persist the new order to Firestore.
 * Merges the reordered enabled widgets back with any disabled widgets.
 */
const onDragEnd = async () => {
  if (!preferences.value) return;

  const disabledWidgets = preferences.value.dashboardLayout.filter(w => !w.enabled);
  const allWidgets = [...localWidgets.value, ...disabledWidgets];
  await reorderWidgets(allWidgets);
};

onMounted(async () => {
  try {
    await loadPreferences();
  } finally {
    isLoading.value = false;
  }
});
</script>
