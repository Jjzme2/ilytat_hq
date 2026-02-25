<template>
  <div class="flex h-screen overflow-hidden">
    <ClientOnly>
      <CommandPalette />
      <ToastContainer />
      <QuickLaunchManager />
      <AIConfig />
      <ContextMenu />
      <ChatAssistantBar v-if="preferences?.assistantEnabled" />
    </ClientOnly>

    <!-- ═══ Desktop Sidebar ═══ -->
    <aside
      class="hidden md:flex flex-col shrink-0 bg-zinc-950/80 backdrop-blur-xl border-r border-white/5 transition-all duration-300 z-40"
      :class="isSidebarExpanded ? 'w-60' : 'w-[68px]'">
      <!-- Logo -->
      <div class="h-14 flex items-center px-4 border-b border-white/5 shrink-0">
        <NuxtLink to="/" class="flex items-center gap-2.5 group min-w-0">
          <div
            class="w-8 h-8 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center text-white shadow-lg shadow-accent-primary/20 group-hover:scale-110 transition-transform shrink-0">
            <span class="text-[10px] font-black italic">{{ brandInitials }}</span>
          </div>
          <span v-if="isSidebarExpanded"
            class="text-base font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent truncate">
            {{ brandName }}
          </span>
        </NuxtLink>
      </div>

      <!-- Nav Sections -->
      <nav class="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-6 scrollbar-thin">
        <div v-for="(items, section) in filteredNavSections" :key="section">
          <p v-if="isSidebarExpanded" class="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] px-3 mb-2">
            {{ sectionLabels[section] }}
          </p>
          <div v-else class="w-5 mx-auto border-t border-white/5 mb-3 mt-1" />

          <NuxtLink v-for="item in items" :key="item.id" :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative" :class="[
              isActiveRoute(item.to)
                ? 'bg-accent-primary/10 text-accent-primary'
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
            ]" :title="!isSidebarExpanded ? item.label : undefined">
            <!-- Active indicator bar -->
            <div v-if="isActiveRoute(item.to)"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent-primary rounded-r-full" />

            <span :class="item.icon" class="text-lg shrink-0" />
            <span v-if="isSidebarExpanded" class="text-sm font-medium truncate">
              {{ item.label }}
            </span>
          </NuxtLink>
        </div>
      </nav>

      <!-- Collapse Toggle -->
      <div class="border-t border-white/5 p-3 shrink-0">
        <button @click="toggleSidebar"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-zinc-600 hover:text-white hover:bg-white/5 transition-all text-xs font-bold"
          :title="isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'">
          <span :class="isSidebarExpanded ? 'icon-[ph--caret-left-bold]' : 'icon-[ph--caret-right-bold]'"
            class="text-base" />
          <span v-if="isSidebarExpanded">Collapse</span>
        </button>
      </div>
    </aside>

    <!-- ═══ Main Area ═══ -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top Bar -->
      <header
        class="h-14 flex items-center justify-between px-4 md:px-6 bg-primary/80 backdrop-blur-xl border-b border-white/5 shrink-0 sticky top-0 z-50">
        <!-- Left: Mobile Logo (sidebar handles desktop) -->
        <NuxtLink to="/" class="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0 group md:hidden">
          <div class="flex items-center gap-2">
            <div
              class="w-7 h-7 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center text-white shadow-lg shadow-accent-primary/20 group-hover:scale-110 transition-transform">
              <span class="text-[10px] font-black italic">{{ brandInitials }}</span>
            </div>
            <span class="text-lg font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              {{ brandName }}
            </span>
          </div>
        </NuxtLink>

        <!-- Desktop: Page title area (left side since sidebar handles nav) -->
        <div class="hidden md:block" />

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
              class="p-1.5 px-3 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all text-xs font-bold"
              title="Light Theme">
              ☀︎
            </button>
            <button @click="applyTheme('luxury-midnight-silk')"
              class="p-1.5 px-3 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all text-xs font-bold"
              title="Dark Theme">
              ☾
            </button>
            <button @click="applyFavorite"
              class="p-1.5 px-3 rounded-lg hover:bg-white/10 text-rose-400/70 hover:text-rose-400 transition-all text-xs font-bold"
              title="Favorite Theme">
              ❤︎
            </button>
          </div>

          <!-- Theme Controls — Cycle button on mobile -->
          <button @click="cycleTheme"
            class="md:hidden p-2.5 rounded-xl bg-white/5 active:bg-white/10 text-text-tertiary active:scale-95 transition-all"
            title="Cycle Theme">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </button>

          <div class="flex items-center gap-1.5 ml-1">
            <NuxtLink to="/settings" class="flex items-center group">
              <div
                class="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-white text-xs font-black shadow-lg shadow-accent-primary/20 group-hover:scale-105 group-active:scale-95 transition-all border border-white/10">
                {{ userInitials }}
              </div>
            </NuxtLink>

            <button @click="handleLogout"
              class="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-500/10 text-text-tertiary hover:text-red-400 flex items-center justify-center transition-all group"
              title="Log Out">
              <span class="icon-[ph--sign-out-bold] text-lg group-active:scale-90 transition-transform"></span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content — extra bottom padding on mobile for tab bar -->
      <main
        class="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 pb-32 md:pb-8 relative touch-pan-y scroll-smooth">
        <PullToAction>
          <div class="max-w-7xl mx-auto">
            <slot />
          </div>
        </PullToAction>
      </main>

      <!-- ═══ Mobile Bottom Tab Bar ═══ -->
      <nav v-show="showNav"
        class="md:hidden fixed bottom-6 inset-x-6 z-50 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl shadow-black/50 overflow-hidden animate-slide-up">
        <div class="flex items-center justify-around h-16 px-2">
          <NuxtLink v-for="tab in mobileNavTabs" :key="tab.id" :to="tab.to"
            class="flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all duration-300 relative group"
            :class="isActiveRoute(tab.to) ? 'text-accent-primary' : 'text-text-tertiary hover:text-white'">

            <div class="relative z-10 flex flex-col items-center gap-0.5">
              <span :class="tab.icon" class="text-lg transition-all duration-300"
                :class2="isActiveRoute(tab.to) ? 'scale-110 -translate-y-0.5' : 'group-active:scale-90'" />
              <span class="text-[9px] font-bold uppercase tracking-wider opacity-80"
                :class="isActiveRoute(tab.to) ? 'text-accent-primary' : 'text-text-tertiary'">{{ tab.label }}</span>
            </div>

            <!-- Active Indicator Light -->
            <div v-if="isActiveRoute(tab.to)" class="absolute inset-0 bg-accent-primary/10 rounded-2xl animate-pulse">
            </div>
            <div v-if="isActiveRoute(tab.to)"
              class="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent-primary blur-sm rounded-full"></div>
          </NuxtLink>

          <!-- More Button -->
          <button @click="showMoreSheet = true"
            class="flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all duration-300 relative group text-text-tertiary hover:text-white">
            <div class="relative z-10 flex flex-col items-center gap-0.5">
              <span class="icon-[ph--dots-nine-bold] text-lg" />
              <span class="text-[9px] font-bold uppercase tracking-wider opacity-80">More</span>
            </div>
          </button>
        </div>
      </nav>

      <!-- ═══ Mobile "More" Sheet ═══ -->
      <Transition name="sheet">
        <div v-if="showMoreSheet" class="md:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showMoreSheet = false" />

          <!-- Sheet -->
          <div class="relative bg-zinc-950 border-t border-white/10 rounded-t-3xl p-6 pb-10 animate-slide-up">
            <div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />
            <h3 class="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4">All Modules</h3>

            <div class="grid grid-cols-3 gap-3">
              <NuxtLink v-for="item in moreSheetItems" :key="item.id" :to="item.to" @click="showMoreSheet = false"
                class="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all" :class="isActiveRoute(item.to)
                  ? 'bg-accent-primary/10 text-accent-primary'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white active:scale-95'">
                <span :class="item.icon" class="text-2xl" />
                <span class="text-[10px] font-bold uppercase tracking-wider">{{ item.label }}</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIlytatTheme } from '@theme/composables/useIlytatTheme';
import ChatAssistantBar from '~/components/ai/ChatAssistantBar.vue';
import { computed, ref, watch } from 'vue';
import { useScroll } from '@vueuse/core';
import { type NavItem, navigationConfig, getNavBySection, sectionLabels as sectionLabelsConfig } from '@/config/navigation';

const { isDark, applyTheme, applyFavorite } = useIlytatTheme();
const userStore = useUser();
const { open: openCommandPalette } = useCommandPalette();
const { isModuleEnabled } = useModules();
const { preferences, loadPreferences } = useUserPreferences();
const { brandName, brandInitials } = useOrganizationBranding();
const route = useRoute();
const { checkHolidays } = useHolidays();

const sectionLabels = sectionLabelsConfig;

// ── Sidebar State ──
const SIDEBAR_KEY = 'ilytat-sidebar-expanded';
const isSidebarExpanded = ref(true);

onMounted(async () => {
  // Restore sidebar preference
  const saved = localStorage.getItem(SIDEBAR_KEY);
  if (saved !== null) {
    isSidebarExpanded.value = saved === 'true';
  }

  await loadPreferences();
  checkHolidays();
});

const toggleSidebar = () => {
  isSidebarExpanded.value = !isSidebarExpanded.value;
  localStorage.setItem(SIDEBAR_KEY, String(isSidebarExpanded.value));
};

// ── Nav Filtering (respects module enable/disable) ──
const filteredNavSections = computed((): Record<string, NavItem[]> => {
  const sections = getNavBySection();
  const result: Record<string, NavItem[]> = {};

  for (const [section, items] of Object.entries(sections)) {
    const filtered = (items as NavItem[]).filter((item: NavItem) => {
      if (!item.moduleId) return true;
      return isModuleEnabled(item.moduleId);
    });
    if (filtered.length > 0) {
      result[section] = filtered;
    }
  }
  return result;
});

// ── Mobile Nav ──
const mobileNavTabs = computed((): NavItem[] => {
  return navigationConfig
    .filter((item: NavItem) => item.location.includes('mobile'))
    .filter((item: NavItem) => !item.moduleId || isModuleEnabled(item.moduleId))
    .slice(0, 4);
});

const moreSheetItems = computed((): NavItem[] => {
  const mobileIds = new Set(mobileNavTabs.value.map((t: NavItem) => t.id));
  return navigationConfig
    .filter((item: NavItem) => !mobileIds.has(item.id))
    .filter((item: NavItem) => !item.moduleId || isModuleEnabled(item.moduleId));
});

const showMoreSheet = ref(false);

// ── Scroll-Driven Nav Logic ──
const mainContent = ref<HTMLElement | null>(null);
const { directions, y } = useScroll(mainContent);
const showNav = ref(true);

watch(directions, (newDirection) => {
  if (newDirection.bottom) {
    showNav.value = false;
  } else if (newDirection.top) {
    showNav.value = true;
  }
});

watch(y, (newY) => {
  if (newY < 50) showNav.value = true;
});

// ── Route Detection ──
const isActiveRoute = (path: string) => {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
};

// ── Auth ──
const handleLogout = async () => {
  await userStore.signOut();
};

// ── Theme Cycling ──
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

// ── User ──
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
  from {
    transform: translateY(100%);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Sheet transitions */
.sheet-enter-active,
.sheet-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from>div:last-child,
.sheet-leave-to>div:last-child {
  transform: translateY(100%);
}
</style>
