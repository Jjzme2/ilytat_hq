<template>
  <div class="h-full flex flex-col bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
    <div class="p-4 border-b border-white/5 flex justify-between items-center">
      <h3 class="font-semibold text-zinc-100 flex items-center gap-2">
        <span class="i-ph-target text-emerald-400"></span>
        Goals
      </h3>
      <NuxtLink to="/projects" class="text-xs text-zinc-500 hover:text-emerald-400 transition-colors">
        View All
      </NuxtLink>
    </div>
    
    <div class="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
      <div v-if="isLoading" class="flex justify-center p-4">
        <div class="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <div v-else-if="goals.length === 0" class="text-center py-8 text-zinc-500 text-sm">
        <p>No active goals.</p>
      </div>
      
      <div 
        v-for="goal in goals" 
        :key="goal.id"
        class="p-3 rounded-xl bg-zinc-800/30 border border-transparent hover:border-white/5 transition-all"
      >
        <div class="flex justify-between items-start mb-2">
            <h4 class="text-sm font-medium text-zinc-200">{{ goal.title }}</h4>
            <span :class="['text-[10px] px-1.5 py-0.5 rounded-full border', getStatusColor(goal.status)]">
                {{ formatStatus(goal.status) }}
            </span>
        </div>
        <!-- Progress Bar Removed as it's not in model -->
        <div class="flex justify-between items-center mt-1.5 text-[10px] text-zinc-500">
            <span>{{ goal.description ? (goal.description.length > 30 ? goal.description.substring(0,30)+'...' : goal.description) : 'No description' }}</span>
            <span v-if="goal.targetDate">{{ formatDate(goal.targetDate) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTenant } from '~/composables/useTenant';
import { useFirestoreRepository } from '~/composables/useFirestoreRepository';
import { Goal } from '~/models/Goal';
import { where, type QueryConstraint } from 'firebase/firestore';

const { tenantId } = useTenant();
const goals = ref<Goal[]>([]);
const isLoading = ref(true);

const { getAll } = useFirestoreRepository<Goal>('goals', (data) => new Goal(data));

const fetchGoals = async () => {
  if (!tenantId.value) return;
  
  try {
    isLoading.value = true;
    const constraints: QueryConstraint[] = [
      where('tenantId', '==', tenantId.value),
      where('status', 'in', ['not-started', 'in-progress']), // Update to match enum strings likely
    ];
    
    const allGoals = await getAll(constraints);
    goals.value = allGoals.sort((a, b: Goal) => {
         if (!a.targetDate) return 1;
        if (!b.targetDate) return -1;
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    }).slice(0, 5);
    
  } catch (e) {
    console.error("Failed to fetch goals", e);
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatStatus = (status: string) => {
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const getStatusColor = (status: string) => {
    switch(status) {
        case 'not_started': return 'bg-zinc-800 text-zinc-400 border-zinc-700';
        case 'in_progress': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'completed': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
        default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
};

onMounted(() => {
    fetchGoals();
});
</script>
