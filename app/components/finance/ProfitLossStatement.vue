<template>
    <div class="bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden">
        <div class="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h3 class="font-bold text-white">Profit & Loss Statement</h3>
            <button @click="$emit('analyze')" class="text-xs flex items-center gap-1.5 text-accent-primary hover:text-accent-secondary transition-colors uppercase tracking-wider font-bold">
                <span class="i-heroicons-sparkles"></span>
                Analyze
            </button>
        </div>
        
        <div class="divide-y divide-white/5 text-sm">
            <!-- Revenue -->
            <div class="flex justify-between items-center p-4 hover:bg-white/5 transition-colors group">
                <span class="text-zinc-300 font-medium group-hover:text-white transition-colors">Total Revenue</span>
                <span class="text-emerald-400 font-bold">{{ formatCurrency(data.revenue) }}</span>
            </div>

            <!-- COGS -->
            <div class="flex justify-between items-center p-4 pl-8 hover:bg-white/5 transition-colors text-zinc-400 group">
                <span class="group-hover:text-zinc-300 transition-colors">Cost of Goods Sold (COGS)</span>
                <span>({{ formatCurrency(data.cogs) }})</span>
            </div>

            <!-- Gross Profit -->
            <div class="flex justify-between items-center p-4 bg-white/[0.02] border-t border-b border-white/5 font-bold">
                <span class="text-white">Gross Profit</span>
                <div class="text-right">
                    <div class="text-white">{{ formatCurrency(data.grossProfit) }}</div>
                    <div class="text-[10px] text-zinc-500 font-normal">{{ data.grossMargin.toFixed(1) }}% Margin</div>
                </div>
            </div>

            <!-- OpEx -->
            <div class="flex justify-between items-center p-4 pl-8 hover:bg-white/5 transition-colors text-zinc-400 group">
                <span class="group-hover:text-zinc-300 transition-colors">Operating Expenses (OpEx)</span>
                <span class="text-red-400">({{ formatCurrency(data.opex) }})</span>
            </div>

            <!-- Net Income -->
            <div class="flex justify-between items-center p-4 bg-accent-primary/5 border-t border-white/10 font-black text-base">
                <span class="text-white">Net Income</span>
                <div class="text-right">
                    <div :class="data.netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'">
                        {{ formatCurrency(data.netIncome) }}
                    </div>
                    <div class="text-[10px] text-zinc-500 font-normal">{{ data.netMargin.toFixed(1) }}% Net Margin</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    data: {
        revenue: number;
        cogs: number;
        grossProfit: number;
        grossMargin: number;
        opex: number;
        netIncome: number;
        netMargin: number;
    }
}>();

defineEmits(['analyze']);

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};
</script>
