<template>
  <div
    class="pointer-events-auto w-full max-w-xs overflow-hidden rounded-xl shadow-2xl ring-1 transition-all duration-500 transform translate-y-0 opacity-100 backdrop-blur-lg"
    :class="[
      typeClasses,
      toast.dismissible ? 'pr-8' : ''
    ]" role="alert">
    <div class="p-4">
      <div class="flex items-start">
        <!-- Icon based on type -->
        <div class="flex-shrink-0">
          <svg v-if="toast.type === 'success'" class="h-5 w-5 text-emerald-300" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="toast.type === 'error'" class="h-5 w-5 text-red-300" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="toast.type === 'warning'" class="h-5 w-5 text-amber-300" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <svg v-else-if="toast.type === 'info'" class="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="toast.type === 'dev'" class="h-5 w-5 text-purple-300" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>

        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p class="text-sm font-semibold leading-5" :class="textTitleClass">
            {{ toast.type === 'dev' ? '[DEV] ' : '' }}{{ toast.message }}
          </p>
          <!-- Dev Data Dump -->
          <div v-if="toast.type === 'dev' && toast.data">
            <pre
              class="mt-2 rounded bg-black/50 p-2 text-xs text-gray-300 overflow-x-auto font-mono scrollbar-thin">{{ JSON.stringify(toast.data, null, 2) }}</pre>
          </div>
        </div>

        <!-- Action Button -->
        <div v-if="toast.action" class="ml-4 flex flex-shrink-0 items-center">
          <button type="button" @click="toast.action.onClick"
            class="rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold shadow-sm hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            :class="textTitleClass">
            {{ toast.action.label }}
          </button>
        </div>

        <!-- Dismiss Button -->
        <div v-if="toast.dismissible" class="ml-4 flex flex-shrink-0">
          <button type="button" @click="$emit('dismiss', toast.id)"
            class="inline-flex rounded-md bg-transparent hover:bg-white/10 p-0.5 transition-colors"
            :class="dismissClass">
            <span class="sr-only">Close</span>
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Toast } from '../composables/useToast';

const props = defineProps<{
  toast: Toast
}>();

defineEmits(['dismiss']);

/**
 * High-contrast colored backgrounds for each toast type.
 * These do NOT rely on Tailwind's `dark:` mode — they always look good
 * against both light and dark app themes.
 */
const typeClasses = computed(() => {
  const base = 'border-l-4 shadow-2xl';

  switch (props.toast.type) {
    case 'success':
      return `${base} bg-emerald-950/95 border-l-emerald-400 ring-emerald-500/30`;
    case 'error':
      return `${base} bg-red-950/95 border-l-red-400 ring-red-500/30`;
    case 'warning':
      return `${base} bg-amber-950/95 border-l-amber-400 ring-amber-500/30`;
    case 'info':
      return `${base} bg-blue-950/95 border-l-blue-400 ring-blue-500/30`;
    case 'dev':
      return `${base} bg-purple-950/95 border-l-purple-400 ring-purple-500/30 font-mono`;
    default:
      return `${base} bg-zinc-900/95 ring-white/15`;
  }
});

const textTitleClass = computed(() => {
  switch (props.toast.type) {
    case 'success': return 'text-emerald-100';
    case 'error': return 'text-red-100';
    case 'warning': return 'text-amber-100';
    case 'info': return 'text-blue-100';
    case 'dev': return 'text-purple-200 font-medium';
    default: return 'text-zinc-100';
  }
});

const dismissClass = computed(() => {
  switch (props.toast.type) {
    case 'success': return 'text-emerald-300 hover:text-emerald-100';
    case 'error': return 'text-red-300 hover:text-red-100';
    case 'warning': return 'text-amber-300 hover:text-amber-100';
    case 'info': return 'text-blue-300 hover:text-blue-100';
    case 'dev': return 'text-purple-300 hover:text-purple-100';
    default: return 'text-zinc-400 hover:text-zinc-200';
  }
});
</script>
