<template>
  <div class="h-screen w-full flex flex-col items-center justify-center bg-black text-white relative overflow-hidden">
    <!-- Starfield/Void Background -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-80"></div>
    
    <!-- Content -->
    <div class="relative z-10 text-center px-6">
        <h1 class="text-9xl font-bold font-mono tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-800 animate-pulse">
            {{ error?.statusCode || 'ERR' }}
        </h1>
        <div class="h-px w-24 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto my-8"></div>
        <h2 class="text-2xl font-light text-zinc-400 mb-4 uppercase tracking-widest">
            {{ error?.statusCode === 404 ? 'Signal Lost' : 'System Failure' }}
        </h2>
        <p class="text-zinc-500 max-w-md mx-auto mb-10">
            {{ error?.message || 'An unexpected error occurred in the system. Re-establish connection.' }}
        </p>

        <button 
            @click="handleError"
            class="group relative px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-300 backdrop-blur-sm"
        >
            <span class="flex items-center gap-3 text-sm font-medium tracking-wide group-hover:text-white text-zinc-300">
                <span class="i-ph-house-bold text-lg"></span>
                Return to Command
            </span>
            <!-- Glow effect -->
            <div class="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
        </button>
    </div>

    <!-- Decorative Elements -->
    <div class="absolute bottom-10 left-10 font-mono text-xs text-zinc-700">
        ERR_HYPERYARD_MISSING_LINK // {{ error?.statusCode }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  error: Object
});

const handleError = () => {
  clearError({ redirect: '/' });
};
</script>
