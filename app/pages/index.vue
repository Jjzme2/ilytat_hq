<template>
  <div class="space-y-4 md:space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-text-primary">Digital Office</h1>
        <p class="text-text-secondary mt-1">Welcome back, Operator.</p>
      </div>
      <div class="flex gap-3 w-full md:w-auto">
        <button 
            @click="showCustomizer = true"
            class="w-full md:w-auto px-4 py-2.5 md:py-2 bg-secondary text-text-primary border border-border rounded-lg hover:bg-secondary/80 transition-colors shadow-sm text-sm font-medium flex items-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Customize
        </button>
        <button 
            @click="openCommandPalette"
            class="w-full md:w-auto px-4 py-2.5 md:py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-colors shadow-lg shadow-accent-primary/20 text-sm font-medium"
        >
            Quick Action
        </button>
      </div>
    </div>

    <!-- Responsive Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
      <template v-for="widget in enabledWidgets" :key="widget.id">
        <component :is="getWidgetComponent(widget.id)" v-if="getWidgetComponent(widget.id)" />
      </template>
    </div>

    <!-- Customizer Modal -->
    <DashboardCustomizer v-if="showCustomizer" @close="showCustomizer = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCommandPalette } from '#imports';
import { useUserPreferences } from '~/composables/useUserPreferences';
import PulseWidget from '~/components/dashboard/widgets/PulseWidget.vue';
import InboxWidget from '~/components/dashboard/widgets/InboxWidget.vue';
import ProjectsWidget from '~/components/dashboard/widgets/ProjectsWidget.vue';
import TasksWidget from '~/components/dashboard/widgets/TasksWidget.vue';
import GoalsWidget from '~/components/dashboard/widgets/GoalsWidget.vue';
import ScheduleWidget from '~/components/dashboard/widgets/ScheduleWidget.vue';
import FinanceWidget from '~/components/dashboard/widgets/FinanceWidget.vue';
import ThemeWidget from '~/components/dashboard/widgets/ThemeWidget.vue';
import DashboardCustomizer from '~/components/dashboard/DashboardCustomizer.vue';

definePageMeta({
    middleware: ['auth']
});

const { open: openCommandPalette } = useCommandPalette();
const { preferences, loadPreferences } = useUserPreferences();
const showCustomizer = ref(false);

const enabledWidgets = computed(() => {
    if (!preferences.value) return [];
    return preferences.value.dashboardLayout
        .filter(w => w.enabled)
        .sort((a, b) => a.order - b.order);
});

const getWidgetComponent = (id: string) => {
    switch (id) {
        case 'pulse': return PulseWidget;
        case 'inbox': return InboxWidget;
        case 'projects': return ProjectsWidget;
        default: return null;
    }
};

onMounted(async () => {
    await loadPreferences();
});
</script>
