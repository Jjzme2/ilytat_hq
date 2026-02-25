<template>
  <div
    class="chk-theme min-h-screen bg-[var(--app-bg)] text-text-primary transition-[background] duration-500 relative overflow-hidden">
    <!-- Route transition progress bar -->
    <NuxtLoadingIndicator color="var(--accent-primary)" :height="3" :throttle="200" />

    <!-- Premium Splash Screen (randomly picks a variant) -->
    <Transition name="fade">
      <SplashScreen v-if="!isAppReady" :brandName="brandName" />
    </Transition>

    <NuxtLayout v-if="isAppReady">
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useIlytatTheme } from '@theme/composables/useIlytatTheme';
import { useSessionTimeout } from '~/composables/useSessionTimeout';
import { FirebaseAdminAdapter } from '~/services/firebaseAdminAdapter'
import { AdminAdapterKey } from '@admin/types/AdminAdapter'

const { initTheme } = useIlytatTheme();
const { user } = useUser();
const { startMonitoring, stopMonitoring } = useSessionTimeout();
const { brandName } = useOrganizationBranding();
provide(AdminAdapterKey, new FirebaseAdminAdapter())

const isAppReady = ref(false);

onMounted(async () => {
  initTheme();
  startMonitoring();

  // Wait for Firebase auth to be ready (replaces brittle setInterval polling)
  try {
    await waitForFirebaseAuth();
  } catch {
    // Timeout — show the app anyway so users aren't stuck on splash forever
  }
  // Brief delay so the splash animation completes smoothly
  await new Promise(r => setTimeout(r, 600));
  isAppReady.value = true;
});

onUnmounted(() => {
  stopMonitoring();
});

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
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
  filter: blur(1rem);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
