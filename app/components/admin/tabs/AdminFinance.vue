<template>
    <!-- TODO: Implement AdminFinance with useFinance() for tenant-wide view -->
    <div class="space-y-6 md:space-y-8 animate-fade-in">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-lg font-semibold text-white">Financial Overview</h2>
                <p class="text-sm text-zinc-400">Health metrics and recent activity.</p>
            </div>
            <button class="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors border border-white/5">
                Full Report ↗
            </button>
        </div>

        <!-- KPI Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-for="stat in stats" :key="stat.label" class="bg-zinc-900/40 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-xs font-medium text-zinc-400 uppercase tracking-wider">{{ stat.label }}</span>
                     <span 
                        class="text-xs font-bold"
                        :class="stat.trend > 0 ? 'text-emerald-400' : 'text-red-400'"
                     >
                        {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
                     </span>
                </div>
                <div class="text-2xl font-black text-white">{{ stat.value }}</div>
            </div>
        </div>

        <!-- Placeholder Chart -->
        <div class="bg-zinc-900/40 border border-white/5 rounded-xl p-6 min-h-[200px] flex items-center justify-center">
            <div class="text-center">
                <span class="text-4xl mb-2 block">📉</span>
                <p class="text-zinc-500 text-sm">Revenue graph will appear here.</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// import { useFinance } from '~/composables/useFinance'; // Auto-imported
import { computed } from 'vue';

const { totalBalance, monthlyComparison } = useFinance();

const stats = computed(() => [
    { 
        label: 'Total Balance', 
        value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBalance.value), 
        trend: 0 // totalBalance doesn't have trend in current composable
    },
    { 
        label: 'Expenses (MoM)', 
        value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(monthlyComparison.value.thisMonthExpense), 
        trend: parseFloat(monthlyComparison.value.expenseChange.toFixed(1))
    },
    { 
        label: 'Net Income', 
        value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(monthlyComparison.value.netThisMonth), 
        trend: 0 // Net income trend not explicitly calculated in % yet, could add later
    },
]);
</script>
