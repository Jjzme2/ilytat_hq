<template>
    <div class="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
        <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-white">Cash Flow Trend (L12M)</h3>
            <div class="flex gap-4 text-xs">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span class="text-zinc-400">Income</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-red-500"></div>
                    <span class="text-zinc-400">Expense</span>
                </div>
            </div>
        </div>

        <div class="h-48 flex items-end justify-between gap-2">
            <div 
                v-for="(month, index) in data" 
                :key="index" 
                class="flex flex-col items-center gap-2 w-full group relative"
            >
                <!-- Tooltip -->
                 <div class="absolute bottom-full mb-2 bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs whitespace-nowrap hidden group-hover:block z-10 shadow-xl">
                    <div class="text-emerald-400">In: {{ formatCurrency(month.income) }}</div>
                    <div class="text-red-400">Out: {{ formatCurrency(month.expense) }}</div>
                    <div class="border-t border-white/10 pt-1 mt-1 font-bold text-white">Net: {{ formatCurrency(month.net) }}</div>
                </div>

                <!-- Bars Container -->
                <div class="h-32 w-full flex items-end justify-center gap-1 relative">
                    <!-- Income Bar -->
                    <div 
                        class="w-3 bg-emerald-500/80 hover:bg-emerald-400 transition-all rounded-t-sm"
                        :style="{ height: `${calculateHeight(month.income)}%` }"
                    ></div>
                    <!-- Expense Bar -->
                    <div 
                        class="w-3 bg-red-500/80 hover:bg-red-400 transition-all rounded-t-sm"
                        :style="{ height: `${calculateHeight(month.expense)}%` }"
                    ></div>
                </div>
                
                <!-- Label -->
                <div class="text-[10px] text-zinc-500 font-mono uppercase">{{ month.month }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    data: {
        month: string;
        income: number;
        expense: number;
        net: number;
    }[]
}>();

const maxVal = computed(() => {
    return Math.max(...props.data.map(d => Math.max(d.income, d.expense)), 100); // Minimum 100 for scale
});

const calculateHeight = (val: number) => {
    return Math.max((val / maxVal.value) * 100, 2); // Min height 2% for visibility
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};
</script>
