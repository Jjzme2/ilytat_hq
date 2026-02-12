<template>
    <div
        class="relative group rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden"
        :class="[
            isActive
                ? 'border-accent-primary ring-2 ring-accent-primary/20 bg-accent-primary/5'
                : 'border-white/10 hover:border-white/20 bg-zinc-900/40 hover:bg-zinc-800/60'
        ]"
        @click="$emit('select', theme.id)"
    >
        <!-- Preview Area -->
        <div class="h-24 w-full relative" :style="{ backgroundColor: theme.colors['--bg-primary'] }">
            <!-- Simulated UI elements -->
            <div class="absolute top-3 left-3 w-16 h-4 rounded-md opacity-80" :style="{ backgroundColor: theme.colors['--bg-secondary'] }"></div>
            <div class="absolute top-9 left-3 w-10 h-2 rounded-sm opacity-60" :style="{ backgroundColor: theme.colors['--text-tertiary'] }"></div>

            <div class="absolute top-3 right-3 w-6 h-6 rounded-full" :style="{ backgroundColor: theme.colors['--accent-primary'] }"></div>

            <div class="absolute bottom-3 left-3 right-3 h-8 rounded-lg flex items-center px-2 gap-2" :style="{ backgroundColor: theme.colors['--bg-secondary'], borderColor: theme.colors['--border-color'], borderWidth: '1px' }">
                <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: theme.colors['--accent-secondary'] }"></div>
                <div class="h-1.5 w-12 rounded-full opacity-50" :style="{ backgroundColor: theme.colors['--text-secondary'] }"></div>
            </div>
        </div>

        <!-- Info Area -->
        <div class="p-3 flex justify-between items-center bg-zinc-900/80 backdrop-blur-sm border-t border-white/5">
            <div class="min-w-0">
                <h3 class="text-sm font-medium text-white truncate" :title="theme.name">
                    {{ theme.name }}
                </h3>
                <p class="text-xs text-zinc-500 capitalize">{{ theme.category }}</p>
            </div>

            <!-- Save Toggle -->
            <button
                @click.stop="$emit('toggle-save', theme.id)"
                class="p-1.5 rounded-full transition-colors shrink-0 hover:bg-white/10"
                :class="isSaved ? 'text-accent-primary' : 'text-zinc-600 hover:text-zinc-400'"
                title="Add to Top Themes"
            >
                <svg v-if="isSaved" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
            </button>
        </div>

        <!-- Active Checkmark -->
        <div v-if="isActive" class="absolute top-2 right-2 bg-accent-primary text-white rounded-full p-0.5 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
            </svg>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Theme } from '~/data/themes';

defineProps<{
    theme: Theme;
    isActive: boolean;
    isSaved: boolean;
}>();

defineEmits<{
    (e: 'select', id: string): void;
    (e: 'toggle-save', id: string): void;
}>();
</script>
