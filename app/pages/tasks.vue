<template>
    <div class="space-y-6 md:space-y-8 animate-fade-in p-4 md:p-8 max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <div>
                <Breadcrumbs
                    :items="[{ label: 'Home', to: '/', icon: 'i-heroicons-home' }, { label: 'Tasks', icon: 'i-heroicons-check-circle' }]"
                    class="mb-2" />
                <h1 class="text-2xl md:text-3xl font-bold text-white">Tasks</h1>
                <p class="text-zinc-500 mt-1">Action items towards your goals.</p>
            </div>
        </div>

        <!-- Tasks List -->
        <div class="space-y-2">
            <div v-if="isLoading" class="space-y-2">
                <div v-for="i in 5" :key="i"
                    class="bg-zinc-900/40 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                    <SkeletonLoader :rounded="true" width="24px" height="24px" class="flex-shrink-0" />
                    <div class="flex-1">
                        <SkeletonLoader width="40%" height="20px" class="mb-2" />
                        <SkeletonLoader width="25%" height="12px" />
                    </div>
                </div>
            </div>

            <div v-else-if="tasks.length === 0"
                class="flex flex-col items-center justify-center py-16 text-zinc-500 bg-zinc-900/40 rounded-xl border border-white/5 border-dashed">
                <div class="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                    <span class="i-heroicons-check-circle text-3xl opacity-50"></span>
                </div>
                <h3 class="text-lg font-medium text-white">All caught up!</h3>
                <p class="text-sm mt-1">No pending tasks found across your projects.</p>
            </div>

            <div v-else v-for="task in tasks" :key="task.id"
                class="group relative bg-zinc-900/40 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors flex items-center justify-between overflow-hidden"
                v-spotlight>
                <div class="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-300"
                    style="background: radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.05), transparent 40%);">
                </div>
                <div class="flex items-center gap-4 flex-1">
                    <!-- Checkbox -->
                    <button @click="toggleStatus(task)"
                        class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0"
                        :class="task.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600 hover:border-accent-primary'">
                        <span v-if="task.isCompleted" class="i-heroicons-check text-white text-sm"></span>
                    </button>

                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-3">
                            <h3 class="text-base font-medium text-white truncate"
                                :class="{ 'line-through text-zinc-500': task.isCompleted }">
                                {{ task.title }}
                            </h3>
                            <span v-if="task.priority" class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded"
                                :class="task.priorityColor">
                                {{ task.priority }}
                            </span>
                        </div>

                        <div class="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                            <!-- Project Context -->
                            <NuxtLink v-if="task.projectId" :to="`/projects/${task.projectId}`"
                                class="flex items-center gap-1 hover:text-white transition-colors">
                                <span class="i-heroicons-folder"></span>
                                {{ getProjectName(task.projectId) }}
                            </NuxtLink>

                            <span v-if="task.projectId && task.dueDate" class="text-zinc-700">•</span>

                            <!-- Due Date -->
                            <span v-if="task.dueDate" class="flex items-center gap-1"
                                :class="isOverdue(task) ? 'text-red-400' : ''">
                                <span class="i-heroicons-calendar"></span>
                                {{ new Date(task.dueDate).toLocaleDateString() }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                    <button @click="handleDelete(task.projectId, task.id)"
                        class="p-2 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Delete Task">
                        <span class="i-heroicons-trash"></span>
                    </button>
                    <!-- Edit Button could go here -->
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useTasks } from '~/composables/useTasks';
import { useProjects } from '~/composables/useProjects';
import { useToast } from '@ilytat/notifications';
import { onMounted, ref } from 'vue';
import { TaskStatus } from '../../config/status';
import type { Task } from '~/models/Task';
import SkeletonLoader from '~/components/ui/SkeletonLoader.vue';

definePageMeta({
    layout: 'default',
    middleware: ['auth']
});

const { tasks, isLoading, fetchTasks, deleteTask, updateTask } = useTasks();
const { projects, fetchProjects } = useProjects();
const { success, error: toastError } = useToast();
const projectMap = ref<Record<string, string>>({});

const getProjectName = (projectId: string) => {
    return projectMap.value[projectId] || 'Unknown Project';
};

const handleDelete = async (projectId: string, taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            await deleteTask(projectId, taskId);
            success('Task deleted');
        } catch (e) {
            console.error('Failed to delete task', e);
            toastError('Failed to delete task');
        }
    }
};

const toggleStatus = async (task: any) => {
    try {
        const newStatus = !task.isCompleted;
        const updates: Partial<Task> = {
            isCompleted: newStatus,
            status: newStatus ? TaskStatus.DONE : TaskStatus.TODO
        };
        await updateTask(task.projectId, task.id, updates);
        success(`Task marked as ${newStatus ? 'completed' : 'incomplete'}`);
    } catch (e) {
        console.error('Failed to toggle status', e);
        toastError('Failed to update task');
    }
};

const isOverdue = (task: any) => {
    if (!task.dueDate || task.isCompleted) return false;
    return new Date(task.dueDate) < new Date();
};

onMounted(async () => {
    await fetchTasks();
    await fetchProjects();

    if (projects.value) {
        projects.value.forEach(p => {
            projectMap.value[p.id] = p.name;
        });
    }
});
</script>
