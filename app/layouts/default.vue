<template>
  <div class="flex flex-col h-screen overflow-hidden bg-secondary">
    <ClientOnly>
      <CommandPalette />
      <ToastContainer />
      <QuickLaunchManager />
      <ContextMenu />
    </ClientOnly>

    <!-- Top Bar: Logo, Search, Profile -->
    <header class="h-14 flex items-center justify-between px-3 md:px-6 bg-primary border-b border-border shrink-0">
      <!-- Left: Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
        <img v-if="tenant?.logo" :src="tenant.logo" alt="Company Logo" class="h-7 md:h-8 w-auto object-contain" />
        <span v-else
          class="text-lg md:text-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
          HQ.ILYTAT
        </span>
      </NuxtLink>

      <!-- Center: Search / Command Palette Trigger -->
      <button @click="openCommandPalette"
        class="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-text-tertiary hover:text-text-secondary bg-secondary hover:bg-secondary/80 border border-border rounded-lg transition-colors max-w-xs w-full md:w-72">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span class="truncate">Search or jump to...</span>
        <kbd
          class="ml-auto px-1.5 py-0.5 text-[10px] font-semibold text-text-tertiary bg-primary border border-border rounded">⌘K</kbd>
      </button>

      <!-- Mobile Search Icon Only -->
      <button @click="openCommandPalette"
        class="md:hidden p-2 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-secondary transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      <!-- Right: Theme Toggle + Profile Badge -->
      <div class="flex items-center gap-2 md:gap-3 shrink-0">
        <!-- Theme Controls — Full on desktop -->
        <div class="hidden md:flex items-center bg-secondary/50 rounded-lg p-0.5 border border-border">
          <button @click="applyTheme('luxury-platinum')"
            class="p-1 px-2 rounded-md hover:bg-white/10 text-text-secondary transition-colors" title="Light Theme">
            <span class="text-xs">☀︎</span>
          </button>
          <div class="w-px h-3 bg-border mx-0.5"></div>
          <button @click="applyTheme('luxury-midnight-silk')"
            class="p-1 px-2 rounded-md hover:bg-white/10 text-text-secondary transition-colors" title="Dark Theme">
            <span class="text-xs">☾</span>
          </button>
          <div class="w-px h-3 bg-border mx-0.5"></div>
          <button @click="applyFavorite" class="p-1 px-2 rounded-md hover:bg-white/10 text-rose-400 transition-colors"
            title="Favorite Theme">
            <span class="text-xs">❤︎</span>
          </button>
        </div>

        <!-- Theme Controls — Cycle button on mobile -->
        <button @click="cycleTheme"
          class="md:hidden p-2 rounded-lg hover:bg-secondary text-text-secondary transition-colors" title="Cycle Theme">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </button>

        <button @click="handleLogout" class="p-1.5 rounded-lg hover:bg-secondary text-text-secondary transition-colors"
          title="Sign Out">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>

        <NuxtLink to="/settings" class="flex items-center gap-2 hover:opacity-80 transition-opacity group">
          <div
            class="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-white text-xs font-bold group-hover:ring-2 ring-accent-secondary transition-all">
            {{ userInitials }}
          </div>
        </NuxtLink>
      </div>
    </header>

    <!-- Main Content — extra bottom padding on mobile for tab bar -->
    <main class="flex-1 overflow-x-hidden overflow-y-auto bg-secondary p-3 md:p-6 pb-20 md:pb-6 relative touch-pan-y">
      <PullToAction>
        <slot />
      </PullToAction>
    </main>

    <!-- Mobile Bottom Tab Bar -->
    <nav
      class="md:hidden fixed bottom-0 inset-x-0 z-50 bg-primary/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div class="flex items-center justify-around h-16">
        <NuxtLink v-for="tab in mobileNav" :key="tab.path" :to="tab.path"
          class="flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all duration-200 group"
          :class="isActiveRoute(tab.path) ? 'text-accent-primary' : 'text-text-tertiary'">
          <component :is="tab.icon" class="w-5 h-5 transition-transform duration-200"
            :class="isActiveRoute(tab.path) ? 'scale-110' : 'group-active:scale-90'" />
          <span class="text-[10px] font-medium"
            :class="isActiveRoute(tab.path) ? 'text-accent-primary' : 'text-text-tertiary'">{{ tab.label }}</span>
          <div v-if="isActiveRoute(tab.path)" class="absolute bottom-1 w-1 h-1 rounded-full bg-accent-primary"></div>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useIlytatTheme } from '@theme/composables/useIlytatTheme';
import { h, computed } from 'vue';

const { isDark, applyTheme, applyFavorite } = useIlytatTheme();
const userStore = useUser();
const { tenant } = useTenant();
const { open: openCommandPalette } = useCommandPalette();
const { isModuleEnabled } = useModules();
const route = useRoute();

// Scroll-Driven Nav Logic
const mainContent = ref<HTMLElement | null>(null);
const { directions, y } = useScroll(mainContent);
const showNav = ref(true);

watch(directions, (newDirecton) => {
  if (newDirecton.bottom) {
    showNav.value = false;
  } else if (newDirecton.top) {
    showNav.value = true;
  }
});

// Always show nav at the top
watch(y, (newY) => {
  if (newY < 50) showNav.value = true;
});

const handleLogout = async () => {
  await userStore.signOut();
};

// Mobile theme cycling: light → dark → favorite → light...
const themeIndex = ref(0);
const themes = ['luxury-platinum', 'luxury-midnight-silk', 'favorite'] as const;
const cycleTheme = () => {
  themeIndex.value = (themeIndex.value + 1) % themes.length;
  const next = themes[themeIndex.value];
  if (next === 'favorite') {
    applyFavorite();
  } else {
    applyTheme(next);
  }
};

// Active route detection for bottom nav
const isActiveRoute = (path: string) => {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
};

// SVG icon components for mobile nav
const HomeIcon = {
  render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', class: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' })
  ])
};

const ProjectsIcon = {
  render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', class: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' })
  ])
};

const InboxIcon = {
  render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', class: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' })
  ])
};

const ScheduleIcon = {
  render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', class: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })
  ])
};

const SettingsIcon = {
  render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', class: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }),
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' })
  ])
};

// Map nav items to their module IDs so disabled modules are hidden
const moduleMap: Record<string, string> = {
  '/projects': 'projects',
  '/inbox': 'messaging',
  '/schedule': 'schedule',
};

const allMobileNav = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/projects', label: 'Projects', icon: ProjectsIcon },
  { path: '/inbox', label: 'Inbox', icon: InboxIcon },
  { path: '/schedule', label: 'Schedule', icon: ScheduleIcon },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
];

const mobileNav = computed(() => {
  return allMobileNav.filter(tab => {
    const moduleId = moduleMap[tab.path];
    return !moduleId || isModuleEnabled(moduleId);
  });
});

const userInitials = computed(() => {
  const name = userStore.user.value?.displayName || '';
  if (!name) return 'NU';
  const parts = name.split(' ').filter(p => p.trim());
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
});
</script>
