<template>
    <div class="space-y-6 md:space-y-8 animate-fade-in">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-lg font-semibold text-white">Tenant Tasks</h2>
                <p class="text-sm text-zinc-400">Global view of tasks.</p>
            </div>
        </div>

        <!-- Filter/Search (Placeholder) -->
        <!-- <div class="flex gap-2">
            <input type="text" placeholder="Search tasks..." class="bg-zinc-800 border-none rounded-lg px-3 py-1.5 text-sm text-white w-full max-w-xs" />
        </div> -->

        <!-- Tasks List -->
        <div class="space-y-2">
            <div v-if="isLoading" class="text-center py-8 text-zinc-500">Loading tasks...</div>
            <div v-else-if="tasks.length === 0" class="text-center py-8 text-zinc-500 bg-zinc-900/40 rounded-xl border border-white/5">
                No active tasks found.
            </div>
            <div v-else v-for="task in tasks" :key="task.id" class="bg-zinc-900/40 border border-white/5 rounded-xl p-3 hover:border-white/10 transition-colors flex items-center justify-between group">
                <div class="flex items-center gap-3">
                    <!-- Status Indicator -->
                     <button
                        @click="toggleStatus(task)"
                        class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                        :class="task.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600 hover:border-accent-primary'"
                    >
                        <span v-if="task.isCompleted" class="i-heroicons-check text-white text-xs"></span>
                    </button>

                    <div>
                        <h3 class="text-sm font-medium text-white" :class="{'line-through text-zinc-500': task.isCompleted}">{{ task.title }}</h3>
                        <div class="flex items-center gap-2 mt-0.5">
                            <span v-if="task.projectId" class="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                                {{ getProjectName(task.projectId) }}
                            </span>
                            <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded" :class="task.priorityColor">
                                {{ task.priority }}
                            </span>
                             <span v-if="task.dueDate" class="text-[10px] text-zinc-400 flex items-center gap-1">
                                <span class="i-heroicons-calendar"></span>
                                {{ new Date(task.dueDate).toLocaleDateString() }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        @click="handleDelete(task.projectId, task.id)"
                        class="p-1.5 text-zinc-500 hover:text-red-400 transition-colors rounded hover:bg-white/5"
                        title="Delete Task"
                    >
                        <span class="i-heroicons-trash"></span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useTasks } from '~/composables/useTasks';
import { useProjects } from '~/composables/useProjects';
import { onMounted, ref } from 'vue';
import type { Task } from '~/models/Task';
import { TaskStatus } from '../../../../config/status';

const { tasks, isLoading, fetchTasks, deleteTask, updateTask } = useTasks();
const { projects, fetchProjects } = useProjects();

const projectMap = ref<Record<string, string>>({});

const getProjectName = (projectId: string) => {
    return projectMap.value[projectId] || 'Unknown';
};

const handleDelete = async (projectId: string, taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
        await deleteTask(projectId, taskId);
    }
};

const toggleStatus = async (task: any) => {
    const newStatus = !task.isCompleted;
    // Update isCompleted AND status for consistency
    const updates: Partial<Task> = {
        isCompleted: newStatus,
        status: newStatus ? TaskStatus.DONE : TaskStatus.TODO
    };
    await updateTask(task.projectId, task.id, updates);
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
