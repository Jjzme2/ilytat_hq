<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-text-primary">Digital Office</h1>
        <p class="text-text-secondary mt-1">Welcome back, Operator.</p>
      </div>
      <div class="flex gap-3">
        <button 
            @click="openCommandPalette"
            class="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-colors shadow-lg shadow-accent-primary/20"
        >
            Quick Action
        </button>
      </div>
    </div>

    <!-- Responsive Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <!-- Widget 1: Pulse -->
      <div class="p-6 rounded-2xl bg-primary border border-border shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-text-primary">Pulse</h3>
          <span class="text-xs px-2 py-1 rounded" :class="statusColor">{{ systemStatus }}</span>
        </div>
        <div class="space-y-4">
            <div class="flex justify-between items-center">
                <span class="text-text-secondary text-sm">System Health</span>
                <span class="text-accent-primary font-mono text-sm">{{ systemHealth.toFixed(1) }}%</span>
            </div>
            <div class="w-full bg-secondary rounded-full h-2">
                <div class="bg-accent-primary h-2 rounded-full transition-all duration-500" :style="{ width: `${systemHealth}%` }"></div>
            </div>
             <div class="grid grid-cols-2 gap-2 mt-4">
                <div v-for="service in services.slice(0, 4)" :key="service.name" class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full" :class="service.status === 'online' ? 'bg-green-500' : 'bg-red-500'"></div>
                    <span class="text-xs text-text-tertiary truncate">{{ service.name }}</span>
                </div>
            </div>
        </div>
      </div>

      <!-- Widget 2: Inbox -->
      <div class="p-6 rounded-2xl bg-primary border border-border shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-text-primary">Inbox</h3>
          <span class="text-xs px-2 py-1 rounded bg-secondary text-text-secondary">{{ unreadCount }} New</span>
        </div>
        <ul class="space-y-3" v-if="recentMessages.length > 0">
            <li 
                v-for="msg in recentMessages" 
                :key="msg.id"
                @click="navigateTo('/inbox')"
                class="flex items-start gap-3 p-2 rounded hover:bg-secondary cursor-pointer transition-colors"
            >
                <div class="w-2 h-2 mt-2 rounded-full shrink-0" :class="msg.read ? 'bg-transparent border border-zinc-500' : 'bg-blue-500'"></div>
                <div class="overflow-hidden">
                    <p class="text-sm font-medium text-text-primary truncate">{{ msg.subject }}</p>
                    <p class="text-xs text-text-tertiary truncate">{{ msg.from }}</p>
                </div>
            </li>
        </ul>
        <div v-else class="text-center py-4 text-text-tertiary text-sm">
            No recent messages
        </div>
      </div>

      <!-- Widget 3: Active Projects -->
      <div class="p-6 rounded-2xl bg-primary border border-border shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-text-primary">Active Projects</h3>
            <button @click="navigateTo('/projects')" class="text-xs text-accent-primary hover:underline">View All</button>
        </div>
        <div v-if="activeProjects.length > 0" class="space-y-3">
            <div 
                v-for="project in activeProjects" 
                :key="project.id"
                @click="navigateTo(`/projects/${project.id}`)"
                class="group p-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border transition-all cursor-pointer"
            >
                <div class="flex justify-between items-start mb-1">
                    <h4 class="font-medium text-sm text-text-primary group-hover:text-accent-primary transition-colors">{{ project.name }}</h4>
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        {{ project.progress }}%
                    </span>
                </div>
                <div class="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1 mt-2">
                    <div class="bg-accent-primary h-1 rounded-full" :style="{ width: `${project.progress}%` }"></div>
                </div>
            </div>
        </div>
         <div v-else class="flex flex-col items-center justify-center h-48 text-center">
            <div class="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            </div>
            <p class="text-sm text-text-secondary font-medium">No active projects</p>
            <p class="text-xs text-text-tertiary mt-1">Start a new project to get moving.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useCommandPalette, useUser } from '#imports';
import { useFirestoreRepository } from '~/composables/useFirestoreRepository';
import { InboxMessage } from '~/models/InboxMessage';
import { Project } from '~/models/Project';
import { orderBy, limit, where } from 'firebase/firestore';

definePageMeta({
    middleware: ['auth']
});

const { open: openCommandPalette } = useCommandPalette();
const { tenantId } = useTenant();
const { services, checkHealth } = useSystemHealth();

// Repositories
const inboxRepo = useFirestoreRepository('messages', (data) => new InboxMessage(data));
const projectRepo = useFirestoreRepository('projects', (data) => new Project(data));

// State
const recentMessages = ref<InboxMessage[]>([]);
const activeProjects = ref<Project[]>([]);
const unreadCount = computed(() => recentMessages.value.filter(m => !m.read).length);

// System Health Computed
const systemHealth = computed(() => {
    const total = services.value.length;
    const online = services.value.filter(s => s.status === 'online').length;
    return total > 0 ? (online / total) * 100 : 0;
});

const systemStatus = computed(() => {
    if (systemHealth.value === 100) return 'Online';
    if (systemHealth.value > 80) return 'Degraded';
    return 'Offline';
});

const statusColor = computed(() => {
    if (systemHealth.value === 100) return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    if (systemHealth.value > 80) return 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
    return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
});

const loadProjects = async () => {
    const { user } = useUser();
    if (!tenantId.value || !user.value?.uid) return;
    
    try {
         activeProjects.value = await projectRepo.getAll([
            where('tenantId', '==', tenantId.value),
            where('status', '==', 'active'),
            where('members', 'array-contains', user.value.uid),
            orderBy('updatedAt', 'desc'),
            limit(5)
        ]);
    } catch (e) {
        console.error("Failed to load active projects", e);
    }
};

// Data Loading
onMounted(async () => {
    await checkHealth();
    
    try {
        const { user } = useUser();
        if (user.value) {
            recentMessages.value = await inboxRepo.getAll([
                where('recipientUid', '==', user.value.uid),
                orderBy('createdAt', 'desc'), 
                limit(5)
            ]); 
        }
    } catch (e) {
        console.error("Failed to load inbox messages", e);
    }
});

// Watch for tenantId or user to load projects
watch([tenantId, () => useUser().user.value], ([newTenantId, newUser]) => {
    if (newTenantId && newUser) loadProjects();
}, { immediate: true });
</script>
