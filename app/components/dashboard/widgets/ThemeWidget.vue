<template>
  <div class="h-full flex flex-col bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm relative transition-all">
    <div 
        class="absolute inset-0 opacity-20 transition-colors duration-500 pointer-events-none"
        :style="{ background: currentTheme.colors['--accent-primary'] }"
    ></div>

    <div class="p-4 border-b border-white/5 flex justify-between items-center relative z-10">
      <h3 class="font-semibold text-zinc-100 flex items-center gap-2">
        <span class="i-ph-paint-brush-broad text-white"></span>
        Theme
      </h3>
      <NuxtLink to="/themes" class="text-xs text-zinc-400 hover:text-white transition-colors">
        Gallery
      </NuxtLink>
    </div>
    
    <div class="flex-1 p-4 flex flex-col gap-4 relative z-10">
       <div class="flex items-center justify-between">
            <div class="text-sm">
                <p class="text-zinc-200 font-medium">{{ currentTheme.name }}</p>
                <p class="text-[10px] text-zinc-400 capitalize">{{ currentTheme.category }}</p>
            </div>
            <div class="flex gap-1">
                <div class="w-6 h-6 rounded-full shadow-lg border border-white/10" :style="{ background: currentTheme.colors['--accent-primary'] }"></div>
                <div class="w-6 h-6 rounded-full shadow-lg border border-white/10" :style="{ background: currentTheme.colors['--accent-secondary'] }"></div>
            </div>
       </div>
       
       <div class="grid grid-cols-4 gap-2">
            <button 
                v-for="theme in quickThemes" 
                :key="theme.id"
                @click="applyTheme(theme.id)"
                class="aspect-square rounded-lg border border-white/10 hover:border-white/40 transition-all relative overflow-hidden group"
                :title="theme.name"
            >
                <div class="absolute inset-0 flex flex-col">
                    <div class="h-1/2" :style="{ background: theme.colors['--bg-primary'] }"></div>
                    <div class="h-1/2" :style="{ background: theme.colors['--bg-secondary'] }"></div>
                </div>
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                    <span class="i-ph-check text-white" v-if="currentTheme.id === theme.id"></span>
                </div>
            </button>
       </div>
       
       <div class="mt-auto flex gap-2">
        <button 
         @click="shuffleTheme"
         class="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-medium text-zinc-300 transition-colors flex items-center justify-center gap-2"
        >
         <span class="i-ph-shuffle"></span>
         Shuffle
        </button>
        <button
         @click="setFavorite(currentTheme.id)"
         class="py-2 px-3 border border-white/5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1"
         :class="favoriteThemeId === currentTheme.id 
            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
            : 'bg-white/5 hover:bg-white/10 text-zinc-300'"
         :title="favoriteThemeId === currentTheme.id ? 'Current Favorite' : 'Set as Favorite'"
        >
         <span v-if="favoriteThemeId === currentTheme.id">❤︎</span>
         <span v-else>♡</span>
        </button>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useIlytatTheme } from '@theme/composables/useIlytatTheme';

const { currentTheme, allThemes, applyTheme, setFavorite, favoriteThemeId } = useIlytatTheme();

const quickThemes = computed(() => {
    // Pick 4 diverse themes
    const favorites = ['minimal-dark', 'neon-night', 'nature-forest', 'cyberpunk-city'];
    return allThemes.value.filter(t => favorites.includes(t.id)).slice(0, 4);
});

const shuffleTheme = () => {
    if (allThemes.value.length === 0) return;
    const random = allThemes.value[Math.floor(Math.random() * allThemes.value.length)];
    if (random) applyTheme(random.id);
};
</script>
