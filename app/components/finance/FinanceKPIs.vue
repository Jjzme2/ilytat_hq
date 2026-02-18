<template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Net Profit -->
        <div class="bg-zinc-900/40 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
            <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Net Profit</span>
                <span 
                    class="text-xs font-bold px-2 py-1 rounded bg-black/20"
                    :class="data.netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'"
                >
                    {{ data.netMargin.toFixed(1) }}% Margin
                </span>
            </div>
            <div class="text-2xl font-black text-white" :class="data.netIncome < 0 ? 'text-red-400' : ''">
                {{ formatCurrency(data.netIncome) }}
            </div>
            <div class="text-xs text-zinc-500 mt-2">
                After OpEx & COGS
            </div>
        </div>

        <!-- Cash on Hand -->
        <div class="bg-zinc-900/40 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
            <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Cash on Hand</span>
            </div>
            <div class="text-2xl font-black text-white">
                {{ formatCurrency(totalCash) }}
            </div>
            <div class="text-xs mt-2 flex items-center gap-2">
                <span class="text-zinc-500">Runway:</span>
                <span 
                    class="font-bold"
                    :class="runway < 3 ? 'text-red-400' : runway < 6 ? 'text-yellow-400' : 'text-emerald-400'"
                >
                    {{ runway >= 999 ? '∞' : runway.toFixed(1) }} Months
                </span>
            </div>
        </div>

        <!-- Burn Rate -->
        <div class="bg-zinc-900/40 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
             <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Avg. Burn Rate</span>
            </div>
            <div class="text-2xl font-black text-white">
                {{ formatCurrency(burnRate) }}
            </div>
            <div class="text-xs text-zinc-500 mt-2">
                Last 3 Months Average
            </div>
        </div>

        <!-- Gross Margin -->
        <div class="bg-zinc-900/40 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
             <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Gross Margin</span>
            </div>
            <div class="text-2xl font-black text-white">
                {{ data.grossMargin.toFixed(1) }}%
            </div>
            <div class="text-xs text-zinc-500 mt-2">
                Gross Profit: {{ formatCurrency(data.grossProfit) }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    data: {
        revenue: number;
        cogs: number;
        grossProfit: number;
        grossMargin: number;
        opex: number;
        netIncome: number;
        netMargin: number;
    };
    burnRate: number;
    runway: number;
    totalCash: number;
}>();

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};
</script>
