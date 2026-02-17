<template>
  <div class="h-full flex flex-col bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm relative group">
    <!-- Glassmorphism gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-50 pointer-events-none"></div>

    <div class="p-4 border-b border-white/5 flex justify-between items-center relative z-10">
      <h3 class="font-semibold text-zinc-100 flex items-center gap-2">
        <span class="i-ph-bank text-emerald-400"></span>
        Finance
      </h3>
      <button class="text-xs text-zinc-500 hover:text-emerald-400 transition-colors">
        Manage
      </button>
    </div>
    
    <div class="flex-1 p-4 flex flex-col justify-center relative z-10">
      <div class="mb-4">
        <p class="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Balance</p>
        <h2 class="text-3xl font-bold text-white tracking-tight">$ 124,592.00</h2>
        <div class="flex items-center gap-1 text-xs text-emerald-400 mt-1">
            <span class="i-ph-trend-up-bold"></span>
            <span>+2.4% this month</span>
        </div>
      </div>
      
      <div class="space-y-3">
        <div v-for="acct in accounts" :key="acct.id" class="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <span :class="acct.icon"></span>
                </div>
                <div>
                    <p class="text-sm font-medium text-zinc-200">{{ acct.name }}</p>
                    <p class="text-[10px] text-zinc-500">**** {{ acct.last4 }}</p>
                </div>
            </div>
            <span class="text-sm font-semibold text-zinc-300">$ {{ acct.balance.toLocaleString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Mock Data for now as per plan
const accounts = ref([
    { id: '1', name: 'Business Checking', last4: '4291', balance: 84320, icon: 'i-ph-wallet' },
    { id: '2', name: 'Savings Reserve', last4: '9921', balance: 40272, icon: 'i-ph-piggy-bank' },
]);
</script>
