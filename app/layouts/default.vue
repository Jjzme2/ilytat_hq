<template>
  <div class="flex flex-col h-screen overflow-hidden bg-secondary">
    <ClientOnly>
      <CommandPalette />
      <ToastContainer />
      <QuickLaunchManager />
    </ClientOnly>

    <!-- Top Bar: Logo, Search, Profile -->
    <header class="h-14 flex items-center justify-between px-4 md:px-6 bg-primary border-b border-border shrink-0">
      <!-- Left: Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <img v-if="tenant?.logo" :src="tenant.logo" alt="Company Logo" class="h-8 w-auto object-contain" />
        <span
          v-else
          class="text-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
          HQ.ILYTAT
        </span>
      </NuxtLink>

      <!-- Center: Search / Command Palette Trigger -->
      <button @click="openCommandPalette"
        class="flex items-center gap-2 px-3 py-1.5 text-sm text-text-tertiary hover:text-text-secondary bg-secondary hover:bg-secondary/80 border border-border rounded-lg transition-colors max-w-xs w-full md:w-72">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span class="truncate">Search or jump to...</span>
        <kbd
          class="hidden md:inline-block ml-auto px-1.5 py-0.5 text-[10px] font-semibold text-text-tertiary bg-primary border border-border rounded">⌘K</kbd>
      </button>

      <!-- Right: Theme Toggle + Profile Badge -->
      <div class="flex items-center gap-3">
        <button @click="themeStore.toggleTheme"
          class="p-1.5 rounded-lg hover:bg-secondary text-text-secondary transition-colors" title="Toggle Theme">
          <svg v-if="themeStore.isDark" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <NuxtLink to="/settings" class="flex items-center gap-2 hover:opacity-80 transition-opacity group">
          <div
            class="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-white text-sm font-bold group-hover:ring-2 ring-accent-secondary transition-all">
            JJ
          </div>
        </NuxtLink>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-x-hidden overflow-y-auto bg-secondary p-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '~/stores/theme';

const themeStore = useThemeStore();
const userStore = useUser();
const { tenant } = useTenant();
const { open: openCommandPalette } = useCommandPalette();
</script>
