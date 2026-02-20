<template>
  <ClientOnly>
    <TransitionRoot appear :show="isOpen" as="template">
      <Dialog as="div" @close="close" class="relative z-[100]">
        <!-- Backdrop -->
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div
            class="flex min-h-full items-end justify-center md:items-center p-0 md:p-4 text-center"
          >
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 translate-y-full md:translate-y-4 md:scale-95"
              enter-to="opacity-100 translate-y-0 md:scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 translate-y-0 md:scale-100"
              leave-to="opacity-0 translate-y-full md:translate-y-4 md:scale-95"
            >
              <DialogPanel
                class="w-full max-w-lg transform overflow-hidden rounded-t-[2.5rem] md:rounded-2xl bg-zinc-900/90 backdrop-blur-xl border-t md:border border-white/10 p-6 md:p-8 text-left align-middle shadow-2xl transition-all"
              >
                <!-- Drag Handle for Mobile -->
                <div class="md:hidden flex justify-center mb-6 -mt-2">
                  <div class="w-12 h-1.5 bg-white/10 rounded-full" />
                </div>

                <DialogTitle
                  as="h3"
                  class="text-xl md:text-2xl font-bold text-white mb-2 leading-tight"
                >
                  <slot name="title">{{ title }}</slot>
                </DialogTitle>

                <div v-if="$slots.description || description" class="mb-6">
                  <p class="text-sm md:text-base text-zinc-400">
                    <slot name="description">{{ description }}</slot>
                  </p>
                </div>

                <div class="mt-4">
                  <slot />
                </div>

                <!-- Close button for desktop -->
                <button
                  @click="close"
                  class="hidden md:block absolute top-6 right-6 p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </ClientOnly>
</template>

<script setup lang="ts">
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue';

interface Props {
  isOpen: boolean;
  title?: string;
  description?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};
</script>

<style scoped>
/* Ensure bottom sheet padding accounts for safe areas on iOS */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
