<template>
  <div class="p-4 md:p-6 rounded-2xl bg-primary border border-border shadow-sm hover:shadow-md transition-shadow">
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
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useUser, useTenant } from '#imports';
import { useFirestoreRepository } from '~/composables/useFirestoreRepository';
import { Project } from '~/models/Project';
import { orderBy, limit, where } from 'firebase/firestore';

const projectRepo = useFirestoreRepository('projects', (data) => new Project(data));
const activeProjects = ref<Project[]>([]);
const { tenantId } = useTenant();

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

watch([tenantId, () => useUser().user.value], ([newTenantId, newUser]) => {
    if (newTenantId && newUser) loadProjects();
}, { immediate: true });
</script>
