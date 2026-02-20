<template>
  <div class="space-y-4 md:space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
      <div>
        <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
          Control Center
        </h1>
        <div class="flex items-center gap-2 text-zinc-400">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <p class="text-sm font-medium">System Online. Welcome back, Operator.</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3 w-full md:w-auto">
        <!-- Reorder Toggle for Mobile -->
        <button v-if="isMobile" @click="isReorderMode = !isReorderMode"
          :class="[
            'flex-1 md:flex-none px-5 py-3 rounded-2xl border transition-all duration-300 text-sm font-bold flex items-center justify-center gap-2 shadow-xl',
            isReorderMode 
              ? 'bg-accent-primary border-accent-primary text-white shadow-accent-primary/30 scale-105' 
              : 'bg-white/5 border-white/10 text-zinc-400'
          ]">
          <span :class="isReorderMode ? 'i-ph-check-bold' : 'i-ph-arrows-out-card-bold'" class="text-lg"></span>
          {{ isReorderMode ? 'Done Reordering' : 'Reorder Layout' }}
        </button>

        <button @click="showCustomizer = true"
          class="flex-1 md:flex-none px-5 py-3 bg-zinc-900/50 text-white border border-white/10 rounded-2xl hover:bg-zinc-800 transition-all shadow-xl text-sm font-bold flex items-center justify-center gap-2 backdrop-blur-md">
          <span class="i-ph-sliders-horizontal-bold text-lg"></span>
          Customize
        </button>
        <button @click="openCommandPalette"
          class="flex-1 md:flex-none px-5 py-3 bg-gradient-to-tr from-accent-primary to-accent-secondary text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-accent-primary/20 text-sm font-bold">
          Quick Action
        </button>
      </div>
    </div>

    <!-- Responsive Draggable Grid -->
    <template v-if="isLoading">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 h-64 backdrop-blur-sm">
          <SkeletonLoader width="150px" height="24px" class="mb-6 rounded-full" />
          <SkeletonLoader width="100%" height="100%" class="rounded-2xl" />
        </div>
      </div>
    </template>

    <draggable
      v-else-if="localWidgets.length > 0"
      v-model="localWidgets"
      item-key="id"
      :handle="isMobile ? (isReorderMode ? '.drag-handle' : '.non-existent') : '.drag-handle'"
      ghost-class="opacity-20 scale-95"
      :animation="300"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <div class="relative group" :class="isReorderMode && isMobile ? 'ring-2 ring-accent-primary/50 ring-offset-4 ring-offset-zinc-950 rounded-3xl animate-pulse' : ''">
          <!-- Drag Handle -->
          <button
            class="drag-handle absolute top-4 right-4 z-20 p-2 rounded-xl
                   bg-white/10 text-white backdrop-blur-md shadow-lg
                   md:opacity-0 md:group-hover:opacity-100
                   hover:bg-accent-primary hover:text-white cursor-grab active:cursor-grabbing
                   transition-all duration-300"
            :class="isReorderMode && isMobile ? 'scale-110 !opacity-100 bg-accent-primary' : ''"
            title="Drag to reorder"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
              <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
            </svg>
          </button>
          
          <div class="h-full rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl overflow-hidden hover:border-white/10 transition-all duration-500 shadow-2xl">
            <component :is="getWidgetComponent(element.id)" v-if="getWidgetComponent(element.id)" />
          </div>
        </div>
      </template>
    </draggable>

    <div v-else class="py-24 text-center">
      <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
        <span class="i-ph-layout-bold text-3xl text-zinc-600"></span>
      </div>
      <p class="text-zinc-500 font-medium">No widgets active in your system.</p>
      <button @click="showCustomizer = true" class="mt-4 text-accent-primary hover:underline font-bold">
        Initialize Dashboard Modules
      </button>
    </div>

    <!-- Customizer Modal -->
    <DashboardCustomizer v-if="showCustomizer" @close="showCustomizer = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
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
const isReorderMode = ref(false);

// Mobile detection
const isMobile = ref(false);
let mediaQuery: MediaQueryList | null = null;
const updateMobile = () => { isMobile.value = mediaQuery?.matches ?? false };

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
  mediaQuery = window.matchMedia('(max-width: 767px)');
  updateMobile();
  mediaQuery.addEventListener('change', updateMobile);

  try {
    await loadPreferences();
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  mediaQuery?.removeEventListener('change', updateMobile);
});
</script>
