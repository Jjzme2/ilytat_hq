<template>
  <div class="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
    <!-- Dynamic Background Variant -->
    <component :is="selectedVariant.component" />

    <!-- Shared Foreground Content -->
    <div class="relative z-10 space-y-8 animate-fade-in-up">
      <div class="flex flex-col items-center">
        <div
          class="w-24 h-24 bg-gradient-to-tr from-accent-primary to-accent-secondary rounded-3xl flex items-center justify-center shadow-2xl shadow-accent-primary/50 relative group">
          <div class="absolute inset-0 bg-white/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all animate-pulse" />
          <span class="text-3xl font-black italic text-white relative z-10">HQ</span>
        </div>
        <h1 class="text-3xl font-bold text-white tracking-widest mt-8 uppercase">{{ brandName }}</h1>
        <div class="flex items-center gap-3 mt-2 text-accent-primary/80 font-black tracking-[0.3em] uppercase text-[10px]">
          <span class="w-8 h-px bg-accent-primary/30" />
          Digital Office
          <span class="w-8 h-px bg-accent-primary/30" />
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex flex-col items-center gap-2">
          <div class="w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
            <div class="absolute inset-0 bg-gradient-to-r from-accent-primary to-accent-secondary animate-shimmer scale-x-[1.5]" />
          </div>
          <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest animate-pulse mt-2">
            Welcome to work
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * SplashScreen — Orchestrator that picks a random splash variant.
 *
 * Each page load randomly selects a background visual from the registry.
 * The foreground (logo, brand, progress bar) is always the same.
 */
import { getRandomSplash } from './splashScreens/index';

defineProps<{
  brandName: string;
}>();

// Pick once on component creation — stable for this session
const selectedVariant = getRandomSplash();
</script>

<style>
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 2s infinite ease-in-out;
}
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
