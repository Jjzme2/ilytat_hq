<template>
    <Teleport to="body">
        <Transition enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0">
            <div v-if="contextMenu.visible" ref="menuRef"
                class="fixed z-[9999] w-48 rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl py-1 overflow-hidden ring-1 ring-black/5 focus:outline-none"
                :style="menuStyle">
                <div v-if="actions.length === 0" class="px-4 py-2 text-sm text-gray-500">
                    No actions
                </div>

                <button v-for="action in actions" :key="action.label"
                    class="flex items-center w-full px-4 py-2 text-sm text-left group transition-colors hover:bg-white/10"
                    :class="{ 'text-red-400': action.variant === 'danger', 'text-gray-200': action.variant !== 'danger' }"
                    @click="handleAction(action)">
                    <UIcon v-if="action.icon" :name="action.icon"
                        class="w-4 h-4 mr-2 opacity-70 group-hover:opacity-100" />
                    {{ action.label }}
                </button>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { contextActions, type ContextMenuAction } from '~/config/context-menu'

const { contextMenu, hide } = useContextMenu()
const menuRef = ref<HTMLElement | null>(null)

// Calculate actions based on type
const actions = computed(() => {
    return contextActions[contextMenu.value.type] || []
})

// Adjust position to keep in viewport
const adjustedX = ref(0)
const adjustedY = ref(0)

const menuStyle = computed(() => ({
    top: `${adjustedY.value}px`,
    left: `${adjustedX.value}px`
}))

// Close on click outside
onClickOutside(menuRef, () => {
    if (contextMenu.value.visible) {
        hide()
    }
})

watch(() => contextMenu.value.visible, async (isVisible) => {
    if (isVisible) {
        await nextTick()
        if (!menuRef.value) return

        const { x, y } = contextMenu.value
        // Initial setup
        adjustedX.value = x
        adjustedY.value = y

        await nextTick() // wait for render to get dimensions

        const { offsetWidth, offsetHeight } = menuRef.value
        const { innerWidth, innerHeight } = window

        let newX = x
        let newY = y

        if (x + offsetWidth > innerWidth) {
            newX = x - offsetWidth
        }

        if (y + offsetHeight > innerHeight) {
            newY = y - offsetHeight
        }

        adjustedX.value = newX
        adjustedY.value = newY
    }
})

const handleAction = (action: ContextMenuAction) => {
    // Handle generic actions or emit event
    // For now, we'll log. ideally we should have an action handler.
    console.log('Action triggered:', action.action, contextMenu.value.data)

    // TODO: Implement a global action handler or bus

    hide()
}
</script>
