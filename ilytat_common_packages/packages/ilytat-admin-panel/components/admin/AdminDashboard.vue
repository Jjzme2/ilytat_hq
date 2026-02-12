<template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        <!-- Stat Cards -->
        <div v-for="(stat, index) in stats" :key="stat.label" 
            class="group relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"
            :class="{'lg:col-span-1': true}">
            
            <!-- Hover Gradient Background -->
            <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div class="relative z-10">
                <div class="flex justify-between items-start mb-4">
                    <div class="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{{ stat.label }}</div>
                    <div class="text-lg opacity-50 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-110 duration-300">
                        {{ index === 0 ? '👥' : index === 1 ? '📋' : index === 2 ? '⚡' : '⏱️' }}
                    </div>
                </div>
                
                <div class="text-4xl font-black text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all duration-300">
                    {{ stat.value }}
                </div>
                
                <div class="flex items-center gap-2" v-if="stat.trend !== undefined">
                    <span class="text-xs font-bold px-1.5 py-0.5 rounded" 
                        :class="stat.trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'">
                        {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
                    </span>
                    <span class="text-[10px] text-slate-500">vs last month</span>
                </div>
            </div>
        </div>

        <!-- System Health Panel -->
        <div class="md:col-span-2 lg:col-span-3 bg-white/5 backdrop-blur-md border border-white/5 p-8 rounded-2xl relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none"></div>
            
            <div class="relative z-10">
                <div class="flex items-center justify-between mb-8">
                    <h3 class="text-lg font-bold text-white flex items-center gap-3">
                        <span class="text-amber-500">⚡</span>
                        System Health Status
                    </h3>
                    <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span class="relative flex h-2 w-2">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span class="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Operational</span>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div v-for="service in services" :key="service.name" 
                        class="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors group/item">
                        <div class="flex flex-col">
                            <span class="text-xs font-bold text-slate-300 group-hover/item:text-white transition-colors">{{ service.name }}</span>
                            <span class="text-[10px] text-slate-500 font-mono">{{ service.status === 'online' ? '12ms latency' : 'TIMEOUT' }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                             <div class="relative">
                                <div class="w-1.5 h-1.5 rounded-full"
                                    :class="service.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'"></div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions Panel -->
        <div class="lg:col-span-1 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-md border border-white/5 p-6 rounded-2xl flex flex-col justify-between group hover:border-indigo-500/20 transition-all duration-300 relative z-10">
            <div>
                <h3 class="text-lg font-bold text-white mb-1">Quick Actions</h3>
                <p class="text-xs text-slate-500 mb-6">Common administrative tasks</p>
            </div>
            
            <div class="grid grid-cols-1 gap-3">
                <button @click="addToast({ title: 'Flush Redis', message: 'Redis cache flush triggered successfully.', type: 'success' })"
                    class="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 text-slate-300 hover:text-white rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-300 text-left flex items-center justify-between group/btn cursor-pointer relative z-20">
                    <span>Flush Redis</span>
                    <span class="text-indigo-400 opacity-0 group-hover/btn:opacity-100 transition-opacity -translate-x-2 group-hover/btn:translate-x-0 duration-300">→</span>
                </button>
                <button @click="addToast({ title: 'Rotate Keys', message: 'Security keys rotation initiated.', type: 'info' })"
                    class="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 text-slate-300 hover:text-white rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-300 text-left flex items-center justify-between group/btn cursor-pointer relative z-20">
                    <span>Rotate Keys</span>
                    <span class="text-purple-400 opacity-0 group-hover/btn:opacity-100 transition-opacity -translate-x-2 group-hover/btn:translate-x-0 duration-300">→</span>
                </button>
                <button @click="addToast({ title: 'Backup Data', message: 'Database backup started in background.', type: 'warning' })"
                    class="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-pink-500/30 text-slate-300 hover:text-white rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-300 text-left flex items-center justify-between group/btn cursor-pointer relative z-20">
                    <span>Backup Data</span>
                    <span class="text-pink-400 opacity-0 group-hover/btn:opacity-100 transition-opacity -translate-x-2 group-hover/btn:translate-x-0 duration-300">→</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { AdminAdapterKey, type AdminAdapter, type AdminStat } from '../../types/AdminAdapter'
import { useToast } from '@ilytat/notifications'

const { addToast } = useToast()
const adminAdapter = inject<AdminAdapter>(AdminAdapterKey)

const services = ref<{name: string, status: string, latency?: string}[]>([])
const stats = ref<AdminStat[]>([
    { label: 'Total Users', value: '...', trend: 0 },
    { label: 'Active Tasks', value: '...', trend: 0 },
    { label: 'Audit Events', value: '...', trend: 0 },
    { label: 'System Uptime', value: '...', trend: 0 },
])

const loadStats = async () => {
    if (!adminAdapter) {
        console.error('AdminAdapter not provided!')
        return
    }

    try {
        const [dashboardStats, healthStatus] = await Promise.all([
            adminAdapter.getDashboardStats(),
            adminAdapter.getSystemHealth()
        ])
        
        stats.value = dashboardStats
        services.value = healthStatus
        
    } catch (e) {
        console.error('Failed to load admin stats:', e)
    }
}

onMounted(loadStats)
</script>
