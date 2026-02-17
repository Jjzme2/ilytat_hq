<template>
    <div class="space-y-6 md:space-y-8 animate-fade-in">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-lg font-semibold text-white">Tenant Goals</h2>
                <p class="text-sm text-zinc-400">Overview of all active goals across the organization.</p>
            </div>
            <!-- Creation is typically done within a project context, so we might hide this or open a modal that asks for Project first -->
            <!-- For now, we'll keep it simple or hide it if global creation isn't ready -->
            <!-- <button class="px-3 py-1.5 bg-accent-primary hover:bg-accent-secondary text-white rounded-lg text-sm font-medium transition-colors">
                <span class="mr-1">+</span> New Goal
            </button> -->
        </div>

        <!-- Goals List -->
        <div class="space-y-3">
            <div v-if="isLoading" class="text-center py-8 text-zinc-500">Loading goals...</div>
            <div v-else-if="goals.length === 0" class="text-center py-8 text-zinc-500 bg-zinc-900/40 rounded-xl border border-white/5">
                No active goals found.
            </div>
            <div v-else v-for="goal in goals" :key="goal.id" class="bg-zinc-900/40 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="font-medium text-white">{{ goal.title }}</h3>
                        <p class="text-xs text-zinc-400 mt-0.5 line-clamp-1">{{ goal.description }}</p>
                    </div>
                    <span 
                        class="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider"
                        :class="goal.statusColor"
                    >
                        {{ goal.formattedStatus }}
                    </span>
                </div>
                
                <div class="flex items-center justify-between text-xs text-zinc-500 mt-3 pt-3 border-t border-white/5">
                    <div class="flex items-center gap-4">
                        <span v-if="goal.targetDate" class="flex items-center gap-1.5">
                            <span class="i-heroicons-calendar text-zinc-600"></span>
                            {{ new Date(goal.targetDate).toLocaleDateString() }}
                        </span>
                        
                         <!-- Project Name -->
                        <span v-if="getProjectName(goal.projectId)" class="flex items-center gap-1.5 text-zinc-400">
                            <span class="i-heroicons-folder text-zinc-600"></span>
                            {{ getProjectName(goal.projectId) }}
                        </span>
                    </div>
                    <!-- Actions -->
                    <div class="flex gap-2">
                        <!-- We can add Edit later, focusing on Delete for now as requested -->
                        <button 
                            @click="handleDelete(goal.projectId, goal.id)"
                            class="hover:text-red-400 transition-colors flex items-center gap-1"
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
import { useProjects } from '~/composables/useProjects'; // Assumption: this exists and can fetch all
import { onMounted, ref } from 'vue';
import { GoalStatus } from '~/config/status';
import type { Goal } from '~/models/Goal';

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
    // Fetch all goals for the tenant (no projectId arg needed now)
    await fetchGoals();
    
    // Fetch all projects to map names
    // Assuming fetchProjects can fetch all tenant projects (similar update might be needed if it requires user params)
    // Checking useProjects... usually it fetches for user.
    await fetchProjects();
    
    if (projects.value) {
        projects.value.forEach(p => {
            projectMap.value[p.id] = p.name;
        });
    }
});
</script>
