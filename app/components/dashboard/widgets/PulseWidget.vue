<template>
  <div class="p-4 md:p-6 rounded-2xl bg-primary border border-border shadow-sm hover:shadow-md transition-shadow">
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
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';

// Service interface for type safety
interface Service {
    name: string;
    status: string;
}

const { services, checkHealth } = useSystemHealth();

const systemHealth = computed(() => {
    const srvs = services.value as Service[];
    const total = srvs.length;
    const online = srvs.filter((s) => s.status === 'online').length;
    return total > 0 ? (online / total) * 100 : 0;
});

const systemStatus = computed(() => {
    if (systemHealth.value === 100) return 'Online';
    if (systemHealth.value > 80) return 'Degraded';
    return 'Offline';
});

const statusColor = computed(() => {
    if (systemHealth.value === 100) return 'text-green-400 bg-green-900/30';
    if (systemHealth.value > 80) return 'text-yellow-400 bg-yellow-900/30';
    return 'text-red-400 bg-red-900/30';
});

onMounted(async () => {
    await checkHealth();
});
</script>
