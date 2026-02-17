<template>
  <Teleport to="body">
    <!-- Top Left -->
    <TransitionGroup name="toast" tag="div" v-if="topLeftToasts.length > 0" class="fixed top-0 left-0 z-[9999] flex flex-col gap-4 p-4 items-start w-full max-w-xs pointer-events-none">
        <ToastItem 
            v-for="toast in topLeftToasts" 
            :key="toast.id" 
            :toast="toast" 
            @dismiss="remove"
        />
    </TransitionGroup>

    <!-- Top Center -->
    <TransitionGroup name="toast" tag="div" v-if="topCenterToasts.length > 0" class="fixed top-0 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-4 p-4 items-center w-full max-w-xs pointer-events-none">
        <ToastItem 
            v-for="toast in topCenterToasts" 
            :key="toast.id" 
            :toast="toast" 
            @dismiss="remove"
        />
    </TransitionGroup>

    <!-- Top Right -->
    <TransitionGroup name="toast" tag="div" v-if="topRightToasts.length > 0" class="fixed top-0 right-0 z-[9999] flex flex-col gap-4 p-4 items-end w-full max-w-xs pointer-events-none">
        <ToastItem 
            v-for="toast in topRightToasts" 
            :key="toast.id" 
            :toast="toast" 
            @dismiss="remove"
        />
    </TransitionGroup>

    <!-- Bottom Left -->
    <TransitionGroup name="toast" tag="div" v-if="bottomLeftToasts.length > 0" class="fixed bottom-0 left-0 z-[9999] flex flex-col-reverse gap-4 p-4 mb-20 md:mb-0 items-start w-full max-w-xs pointer-events-none">
        <ToastItem 
            v-for="toast in bottomLeftToasts" 
            :key="toast.id" 
            :toast="toast" 
            @dismiss="remove"
        />
    </TransitionGroup>

    <!-- Bottom Center -->
    <TransitionGroup name="toast" tag="div" v-if="bottomCenterToasts.length > 0" class="fixed bottom-0 left-1/2 -translate-x-1/2 z-[9999] flex flex-col-reverse gap-4 p-4 mb-20 md:mb-0 items-center w-full max-w-xs pointer-events-none">
        <ToastItem 
            v-for="toast in bottomCenterToasts" 
            :key="toast.id" 
            :toast="toast" 
            @dismiss="remove"
        />
    </TransitionGroup>

    <!-- Bottom Right -->
    <TransitionGroup name="toast" tag="div" v-if="bottomRightToasts.length > 0" class="fixed bottom-0 right-0 z-[9999] flex flex-col-reverse gap-4 p-4 mb-20 md:mb-0 items-end w-full max-w-xs pointer-events-none">
        <ToastItem 
            v-for="toast in bottomRightToasts" 
            :key="toast.id" 
            :toast="toast" 
            @dismiss="remove"
        />
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useToast } from '../composables/useToast';
import ToastItem from './ToastItem.vue';

const { toasts, remove } = useToast();

const topLeftToasts = computed(() => toasts.value.filter(t => t.position === 'top-left'));
const topCenterToasts = computed(() => toasts.value.filter(t => t.position === 'top-center'));
const topRightToasts = computed(() => toasts.value.filter(t => t.position === 'top-right'));
const bottomLeftToasts = computed(() => toasts.value.filter(t => t.position === 'bottom-left'));
const bottomCenterToasts = computed(() => toasts.value.filter(t => t.position === 'bottom-center'));
const bottomRightToasts = computed(() => toasts.value.filter(t => t.position === 'bottom-right'));
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
