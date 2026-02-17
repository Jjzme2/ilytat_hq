<template>
  <div class="h-full flex flex-col bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
    <div class="p-4 border-b border-white/5 flex justify-between items-center">
      <h3 class="font-semibold text-zinc-100 flex items-center gap-2">
        <span class="i-ph-check-square text-indigo-400"></span>
        My Tasks
      </h3>
      <NuxtLink to="/projects" class="text-xs text-zinc-500 hover:text-indigo-400 transition-colors">
        View All
      </NuxtLink>
    </div>
    
    <div class="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
      <div v-if="isLoading" class="flex justify-center p-4">
        <div class="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <div v-else-if="tasks.length === 0" class="text-center py-8 text-zinc-500 text-sm">
        <p>No active tasks assigned to you.</p>
      </div>
      
      <div 
        v-for="task in tasks" 
        :key="task.id"
        class="group p-3 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/50 border border-transparent hover:border-white/5 transition-all cursor-pointer"
      >
        <div class="flex items-start gap-3">
          <button 
            @click.stop="completeTask(task)"
            class="mt-0.5 w-4 h-4 rounded border border-zinc-600 hover:border-indigo-500 hover:bg-indigo-500/20 transition-colors flex items-center justify-center group/btn"
          >
            <span class="i-ph-check text-xs text-indigo-400 opacity-0 group-hover/btn:opacity-100"></span>
          </button>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-zinc-200 font-medium truncate group-hover:text-indigo-200 transition-colors">{{ task.title }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span v-if="task.dueDate" class="text-[10px] text-zinc-500 flex items-center gap-1">
                <span class="i-ph-calendar-blank"></span>
                {{ formatDate(task.dueDate) }}
              </span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-white/5">
                {{ task.priority }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUser } from '~/composables/useUser';
import { useTenant } from '~/composables/useTenant';
import { useFirestoreRepository } from '~/composables/useFirestoreRepository';
import { Task } from '~/models/Task';
import { where, orderBy, limit, type QueryConstraint } from 'firebase/firestore';

const { user } = useUser();
const { tenantId } = useTenant();
const tasks = ref<Task[]>([]);
const isLoading = ref(true);

const { getAll, update } = useFirestoreRepository<any>('tasks', (data) => new Task(data));

const fetchTasks = async () => {
  if (!user.value || !tenantId.value) return;
  
  try {
    isLoading.value = true;
    const constraints: QueryConstraint[] = [
      where('tenantId', '==', tenantId.value),
      where('assigneeId', '==', user.value.uid),
      where('status', '!=', 'completed'),
       // Firestore limitation: cannot filter by status!=completed AND orderBy different field easily without index.
       // We'll filter status in memory if needed or rely on simple queries.
       // Actually '!=' requires index if creating complex query.
       // Let's just fetch assigned tasks and client filter for MVP stability to avoid index errors during demo.
       // Or use 'in' ['todo', 'in_progress', 'review']),
       where('status', 'in', ['todo', 'in_progress', 'review']),
    ];
    
    const allTasks = await getAll(constraints);
    // Sort by due date in memory to avoid index hell
    tasks.value = (allTasks as Task[]).sort((a, b: Task) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }).slice(0, 10);
    
  } catch (e) {
    console.error("Failed to fetch tasks", e);
  } finally {
    isLoading.value = false;
  }
};

const completeTask = async (task: Task) => {
    try {
        await update(task.id, { isCompleted: true, status: 'done' as any }); // Cast as any or import enum TaskStatus.DONE
        tasks.value = tasks.value.filter(t => t.id !== task.id);
    } catch (e) {
        console.error("Failed to complete task", e);
    }
};

const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

onMounted(() => {
    fetchTasks();
});
</script>
