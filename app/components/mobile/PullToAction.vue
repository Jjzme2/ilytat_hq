<template>
    <div ref="container" class="relative overflow-hidden">
        <!-- Feedback Indicator -->
        <div class="absolute top-0 inset-x-0 h-16 flex items-center justify-center pointer-events-none transition-transform duration-200 z-10"
            :style="indicatorStyle">
            <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-accent-primary/20 text-accent-primary backdrop-blur-sm border border-accent-primary/20 shadow-lg scale-0 transition-all"
                :class="{ '!scale-100': isThresholdReached }">
                <UIcon name="i-heroicons-command-line" class="w-5 h-5" />
                <span class="text-sm font-medium">Release to Search</span>
            </div>
        </div>

        <!-- Content slot -->
        <div ref="content" class="transform transition-transform duration-200 ease-out will-change-transform"
            :style="contentStyle">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSwipe } from '@vueuse/core'

const container = ref<HTMLElement | null>(null)
const content = ref<HTMLElement | null>(null)

const { open: openCommandPalette } = useCommandPalette()

// Constants
const THRESHOLD = 120 // px to trigger action
const RESISTANCE = 0.4 // resistance factor for pulling

// State
const translateY = ref(0) // Current visual translation
const isThresholdReached = computed(() => translateY.value >= THRESHOLD * 0.6)

const indicatorStyle = computed(() => ({
    transform: `translateY(${translateY.value - 64}px)`
}))

const contentStyle = computed(() => ({
    transform: `translateY(${translateY.value}px)`
}))

const { isSwiping, direction, lengthY } = useSwipe(container, {
    passive: false,
    onSwipe(e: TouchEvent) {
        const scrollParent = container.value?.parentElement
        const scrollTop = scrollParent ? scrollParent.scrollTop : window.scrollY

        // Only pull if we are at the top of the container
        if (scrollTop > 0) return

        if (direction.value === 'down') {
            // Apply resistance
            translateY.value = Math.max(0, lengthY.value * RESISTANCE)

            // Prevent default only if we are actively pulling
            if (translateY.value > 0 && e.cancelable) {
                e.preventDefault()
            }
        } else {
            translateY.value = 0
        }
    },
    onSwipeEnd() {
        if (isThresholdReached.value) {
            // Trigger Action
            // Haptic feedback if available
            if (navigator.vibrate) navigator.vibrate(50)

            openCommandPalette()
        }

        // Reset
        translateY.value = 0
    }
})
</script>
