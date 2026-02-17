<template>
    <div class="space-y-6 md:space-y-8 animate-fade-in p-4 md:p-8 max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-2xl md:text-3xl font-bold text-white">Goals</h1>
                <p class="text-zinc-500 mt-1">Strategic objectives across your projects.</p>
            </div>
            <!-- Future: Add 'New Goal' button here if global creation is supported -->
        </div>

        <!-- Goals List -->
        <div class="space-y-3">
            <div v-if="isLoading" class="text-center py-12 text-zinc-500">Loading goals...</div>
            
            <div v-else-if="goals.length === 0" class="text-center py-16 text-zinc-500 bg-zinc-900/40 rounded-xl border border-white/5">
                <div class="text-4xl mb-4">🎯</div>
                <h3 class="text-lg font-medium text-white">No active goals</h3>
                <p class="text-sm mt-1">Goals you create in your projects will appear here.</p>
            </div>

            <div v-else v-for="goal in goals" :key="goal.id" class="group bg-zinc-900/40 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="text-lg font-medium text-white group-hover:text-accent-primary transition-colors">{{ goal.title }}</h3>
                        <p class="text-sm text-zinc-400 mt-1 line-clamp-2 max-w-3xl">{{ goal.description }}</p>
                    </div>
                    <span 
                        class="px-2.5 py-1 rounded-full text-xs uppercase font-bold tracking-wider"
                        :class="goal.statusColor"
                    >
                        {{ goal.formattedStatus }}
                    </span>
                </div>
                
                <div class="flex items-center justify-between text-xs text-zinc-500 mt-4 pt-4 border-t border-white/5">
                    <div class="flex items-center gap-6">
                        <!-- Target Date -->
                        <span v-if="goal.targetDate" class="flex items-center gap-2" title="Target Date">
                            <span class="i-heroicons-calendar text-zinc-600 text-sm"></span>
                            {{ new Date(goal.targetDate).toLocaleDateString() }}
                        </span>

                        <!-- Project Link -->
                        <NuxtLink 
                            v-if="goal.projectId" 
                            :to="`/projects/${goal.projectId}`"
                            class="flex items-center gap-2 hover:text-white transition-colors"
                            title="Go to Project"
                        >
                            <span class="i-heroicons-folder text-zinc-600 text-sm"></span>
                            {{ getProjectName(goal.projectId) }}
                        </NuxtLink>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            @click="handleDelete(goal.projectId, goal.id)"
                            class="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                        >
                            <span class="i-heroicons-trash"></span> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useGoals } from '~/composables/useGoals';
import { useProjects } from '~/composables/useProjects';
import { onMounted, ref } from 'vue';

definePageMeta({
    layout: 'default',
    middleware: ['auth']
});

const { goals, isLoading, fetchGoals, deleteGoal } = useGoals();
const { projects, fetchProjects } = useProjects();
const projectMap = ref<Record<string, string>>({});

const getProjectName = (projectId: string) => {
    return projectMap.value[projectId] || 'Unknown Project';
};

const handleDelete = async (projectId: string, goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
        await deleteGoal(projectId, goalId);
    }
};

onMounted(async () => {
    await fetchGoals();
    await fetchProjects();
    
    if (projects.value) {
        projects.value.forEach(p => {
            projectMap.value[p.id] = p.name;
        });
    }
});
</script>
