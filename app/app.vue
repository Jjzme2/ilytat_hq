<template>
  <div>
    <div class="chk-theme min-h-screen bg-primary text-text-primary transition-colors duration-300">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '~/stores/theme';
import { useSessionTimeout } from '~/composables/useSessionTimeout';
// Provide Admin Adapter for UI Library
import { FirebaseAdminAdapter } from '~/services/firebaseAdminAdapter'
import { AdminAdapterKey } from '@admin/types/AdminAdapter'

const store = useThemeStore();
const { startMonitoring, stopMonitoring } = useSessionTimeout();
provide(AdminAdapterKey, new FirebaseAdminAdapter())

// Initialize theme on mount to prevent hydration mismatch if possible,
// though Pinia + VueUse usually handles this well on client-side.
onMounted(() => {
  const savedTheme = localStorage.getItem('vueuse-color-scheme');
  if (savedTheme) {
    store.SetTheme(savedTheme as 'light' | 'dark' | 'auto');
  }
  startMonitoring();
});

onUnmounted(() => {
  stopMonitoring();
});

// Close Command Palette on route change
const route = useRoute();
const { close: closeCommandPalette } = useCommandPalette();
watch(() => route.path, () => {
  closeCommandPalette();
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
</style>
