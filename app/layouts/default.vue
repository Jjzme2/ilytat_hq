<template>
  <div class="flex flex-col h-screen overflow-hidden bg-secondary">
    <ClientOnly>
      <CommandPalette />
      <ToastContainer />
      <QuickLaunchManager />
      <AIConfig />
      <ContextMenu />
    </ClientOnly>

    <!-- Top Bar: Logo, Search, Profile -->
    <header class="h-14 flex items-center justify-between px-4 md:px-6 bg-primary/80 backdrop-blur-xl border-b border-white/5 shrink-0 sticky top-0 z-50">
      <!-- Left: Logo -->
      <NuxtLink to="/" class="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0 group">
        <img v-if="tenant?.logo" :src="tenant.logo" alt="Company Logo" class="h-7 md:h-8 w-auto object-contain" />
        <div v-else class="flex items-center gap-2">
          <div class="w-7 h-7 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center text-white shadow-lg shadow-accent-primary/20 group-hover:scale-110 transition-transform">
            <span class="text-[10px] font-black italic">HQ</span>
          </div>
          <span class="text-lg md:text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent hidden sm:block">
            ILYTAT
          </span>
        </div>
      </NuxtLink>

      <!-- Center: Search / Command Palette Trigger -->
      <button @click="openCommandPalette"
        class="hidden md:flex items-center gap-2.5 px-4 py-2 text-sm text-text-tertiary hover:text-text-secondary bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all max-w-xs w-full md:w-72 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span class="truncate font-medium">Search anything...</span>
        <kbd
          class="ml-auto px-2 py-0.5 text-[10px] font-bold text-text-tertiary bg-black/20 border border-white/10 rounded-md">⌘K</kbd>
      </button>

      <!-- Mobile Search Icon Only -->
      <button @click="openCommandPalette"
        class="md:hidden p-2 rounded-xl text-text-tertiary hover:text-white bg-white/5 active:scale-95 transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      <!-- Right: Theme Toggle + Profile Badge -->
      <div class="flex items-center gap-2 md:gap-4 shrink-0">
        <!-- Theme Controls — Full on desktop -->
        <div class="hidden md:flex items-center bg-black/20 rounded-xl p-0.5 border border-white/5 backdrop-blur-sm">
          <button @click="applyTheme('luxury-platinum')"
            class="p-1.5 px-3 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all text-xs font-bold" title="Light Theme">
            ☀︎
          </button>
          <button @click="applyTheme('luxury-midnight-silk')"
            class="p-1.5 px-3 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all text-xs font-bold" title="Dark Theme">
            ☾
          </button>
          <button @click="applyFavorite" class="p-1.5 px-3 rounded-lg hover:bg-white/10 text-rose-400/70 hover:text-rose-400 transition-all text-xs font-bold"
            title="Favorite Theme">
            ❤︎
          </button>
        </div>

        <!-- Theme Controls — Cycle button on mobile -->
        <button @click="cycleTheme"
          class="md:hidden p-2.5 rounded-xl bg-white/5 active:bg-white/10 text-text-tertiary active:scale-95 transition-all" title="Cycle Theme">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </button>

        <NuxtLink to="/settings" class="flex items-center group ml-1">
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-white text-xs font-black shadow-lg shadow-accent-primary/20 group-hover:scale-105 group-active:scale-95 transition-all border border-white/10">
            {{ userInitials }}
          </div>
        </NuxtLink>
      </div>
    </header>

    <!-- Main Content — extra bottom padding on mobile for tab bar -->
    <main class="flex-1 overflow-x-hidden overflow-y-auto bg-secondary p-4 md:p-8 pb-32 md:pb-8 relative touch-pan-y scroll-smooth">
      <PullToAction>
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </PullToAction>
    </main>

    <!-- Mobile Bottom Tab Bar -->
    <nav
      v-show="showNav"
      class="md:hidden fixed bottom-6 inset-x-6 z-50 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl shadow-black/50 overflow-hidden animate-slide-up"
    >
      <div class="flex items-center justify-around h-16 px-4">
        <NuxtLink v-for="tab in mobileNav" :key="tab.path" :to="tab.path"
          class="flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300 relative group"
          :class="isActiveRoute(tab.path) ? 'text-accent-primary' : 'text-text-tertiary hover:text-white'">
          
          <div class="relative z-10 flex flex-col items-center gap-0.5">
            <component :is="tab.icon" class="w-5 h-5 transition-all duration-300 transform"
              :class="isActiveRoute(tab.path) ? 'scale-110 -translate-y-0.5' : 'group-active:scale-90'" />
            <span class="text-[9px] font-bold uppercase tracking-wider opacity-80"
              :class="isActiveRoute(tab.path) ? 'text-accent-primary' : 'text-text-tertiary'">{{ tab.label }}</span>
          </div>

          <!-- Active Indicator Light -->
          <div v-if="isActiveRoute(tab.path)" 
               class="absolute inset-0 bg-accent-primary/10 rounded-2xl animate-pulse"></div>
          <div v-if="isActiveRoute(tab.path)" 
               class="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent-primary blur-sm rounded-full"></div>
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
  } else if (next) {
    applyTheme(next as string);
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
    return !moduleId || isModuleEnabled(moduleId as string);
  });
});

const userInitials = computed(() => {
  const name = userStore.user.value?.displayName || '';
  if (!name) return 'NU';
  const parts = name.split(' ').filter(p => p.trim());
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0]! + parts[1][0]!).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
});
</script>

<style>
/* Global Transition Styles */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}

.layout-enter-active,
.layout-leave-active {
  transition: all 0.3s;
}
.layout-enter-from,
.layout-leave-to {
  opacity: 0;
  filter: blur(1rem);
}

@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slide-up {
  animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
