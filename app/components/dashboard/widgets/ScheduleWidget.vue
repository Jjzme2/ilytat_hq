<template>
  <div class="h-full flex flex-col bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
    <div class="p-4 border-b border-white/5 flex justify-between items-center">
      <h3 class="font-semibold text-zinc-100 flex items-center gap-2">
        <span class="i-ph-calendar-blank text-amber-400"></span>
        Today's Schedule
      </h3>
      <NuxtLink to="/schedule" class="text-xs text-zinc-500 hover:text-amber-400 transition-colors">
        Open Calendar
      </NuxtLink>
    </div>
    
    <div class="flex-1 overflow-y-auto p-4 scrollbar-thin">
      <div v-if="isLoading" class="flex justify-center">
        <div class="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <div v-else-if="items.length === 0" class="text-center py-8 text-zinc-500 text-sm">
        <p>Nothing scheduled for today.</p>
      </div>
      
      <div v-else class="relative space-y-6 pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
        <div 
            v-for="(item, index) in anyItems" 
            :key="index"
            class="relative"
        >
            <div class="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-900" :class="getItemDotColor(item)"></div>
            
            <div class="bg-zinc-800/30 rounded-xl p-3 border border-white/5">
                <div class="flex justify-between items-start">
                    <h4 class="text-sm font-medium text-zinc-200">{{ item.title }}</h4>
                    <span class="text-[10px] text-zinc-500">{{ formatTime(item._date) }}</span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                     <span class="text-[10px] uppercase tracking-wider font-bold" :class="getItemTypeColor(item)">{{ item._type }}</span>
                     <span v-if="item.duration" class="text-[10px] text-zinc-600">{{ item.duration }}m</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useSchedule } from '~/composables/useSchedule';

const { fetchSchedule, items, isLoading } = useSchedule();

// Cast items to any to avoid strict type checks on union types in template
const anyItems = computed(() => items.value as any[]);

onMounted(async () => {
    // Fetch for today
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    await fetchSchedule(start, end);
});

const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const getItemDotColor = (item: any) => {
    switch(item._type) {
        case 'event': return 'bg-amber-400';
        case 'task': return 'bg-indigo-400';
        case 'goal': return 'bg-emerald-400';
        default: return 'bg-zinc-400';
    }
};

const getItemTypeColor = (item: any) => {
    switch(item._type) {
        case 'event': return 'text-amber-400';
        case 'task': return 'text-indigo-400';
        case 'goal': return 'text-emerald-400';
        default: return 'text-zinc-400';
    }
};
</script>
