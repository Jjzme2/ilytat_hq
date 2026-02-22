<template>
  <div class="chk-theme min-h-screen bg-[var(--app-bg)] text-text-primary transition-[background] duration-500 relative overflow-hidden">
    <!-- Premium Splash Screen -->
    <Transition name="fade">
      <div v-if="!isAppReady" class="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <!-- Background Accents -->
        <div class="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-accent-primary/20 rounded-full blur-[150px] animate-pulse"></div>
        <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-secondary/15 rounded-full blur-[120px] animate-pulse [animation-delay:1s]"></div>

        <div class="relative z-10 space-y-8 animate-fade-in-up">
          <div class="flex flex-col items-center">
            <div class="w-24 h-24 bg-gradient-to-tr from-accent-primary to-accent-secondary rounded-3xl flex items-center justify-center shadow-2xl shadow-accent-primary/50 relative group">
              <div class="absolute inset-0 bg-white/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all animate-pulse"></div>
              <span class="text-3xl font-black italic text-white relative z-10">HQ</span>
            </div>
            <h1 class="text-3xl font-bold text-white tracking-widest mt-8 uppercase">ILYTAT</h1>
            <div class="flex items-center gap-3 mt-2 text-accent-primary/80 font-black tracking-[0.3em] uppercase text-[10px]">
              <span class="w-8 h-px bg-accent-primary/30"></span>
              The Operating System
              <span class="w-8 h-px bg-accent-primary/30"></span>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex flex-col items-center gap-2">
              <div class="w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
                <div class="absolute inset-0 bg-gradient-to-r from-accent-primary to-accent-secondary animate-shimmer scale-x-[1.5]"></div>
              </div>
              <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest animate-pulse mt-2">
                Initializing Intelligence Layer...
              </p>
            </div>
          </div>
        </div>
      </div>
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
const { user, isLoading: isAuthLoading } = useUser();
const { startMonitoring, stopMonitoring } = useSessionTimeout();
provide(AdminAdapterKey, new FirebaseAdminAdapter())

const isAppReady = ref(false);

onMounted(async () => {
  initTheme();
  startMonitoring();
  
  // Wait for auth to initialize
  await new Promise(resolve => {
    const check = setInterval(() => {
      if (!isAuthLoading.value) {
        clearInterval(check);
        // Add a tiny artificial delay for visual smoothness of the splash screen
        setTimeout(() => {
          isAppReady.value = true;
          resolve(true);
        }, 1200);
      }
    }, 100);
  });
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

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 2s infinite ease-in-out;
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
