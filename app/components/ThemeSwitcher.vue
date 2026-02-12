<template>
    <div class="relative" ref="container">
        <!-- Trigger -->
        <button
            @click="isOpen = !isOpen"
            class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary text-text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
            title="Switch Theme"
        >
             <!-- Icon based on active theme base -->
             <svg v-if="themeStore.isDark" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
             </svg>
             <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
             </svg>

             <!-- Chevron -->
             <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 opacity-50 transition-transform duration-200" :class="{'rotate-180': isOpen}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
             </svg>
        </button>

        <!-- Dropdown Menu -->
        <div
            v-if="isOpen"
            class="absolute right-0 mt-2 w-56 rounded-xl bg-primary border border-border shadow-xl ring-1 ring-black/5 z-50 overflow-hidden transform origin-top-right transition-all animate-fade-in"
        >
            <div class="p-2 border-b border-border bg-secondary/30">
                <p class="text-xs font-medium text-text-tertiary px-2 py-1">Top Themes</p>
            </div>

            <div class="max-h-64 overflow-y-auto py-1">
                <button
                    v-for="theme in themeStore.savedThemes"
                    :key="theme.id"
                    @click="selectTheme(theme.id)"
                    class="w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-secondary transition-colors group"
                    :class="theme.id === themeStore.activeThemeId ? 'text-accent-primary font-medium' : 'text-text-secondary'"
                >
                    <div class="flex items-center gap-3">
                        <!-- Color Preview Dot -->
                        <div
                            class="w-3 h-3 rounded-full shadow-sm ring-1 ring-black/5"
                            :style="{ backgroundColor: theme.colors['--accent-primary'] }"
                        ></div>
                        <span>{{ theme.name }}</span>
                    </div>

                    <span v-if="theme.id === themeStore.activeThemeId" class="text-accent-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                            <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                        </svg>
                    </span>
                </button>
            </div>

            <div class="border-t border-border p-1 bg-secondary/30">
                <NuxtLink
                    to="/settings"
                    @click="isOpen = false"
                    class="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-text-tertiary hover:text-text-primary hover:bg-secondary rounded-lg transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                    Manage Themes
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '~/stores/theme';
import { onClickOutside } from '@vueuse/core';

const themeStore = useThemeStore();
const isOpen = ref(false);
const container = ref(null);

onClickOutside(container, () => {
    isOpen.value = false;
});

const selectTheme = (id: string) => {
    themeStore.setTheme(id);
    isOpen.value = false;
};
</script>
