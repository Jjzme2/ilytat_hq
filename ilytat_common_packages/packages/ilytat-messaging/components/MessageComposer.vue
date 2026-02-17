<template>
    <div class="border-t border-white/10 bg-black/30">
        <!-- Reply preview -->
        <div v-if="replyingTo" class="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/10">
            <div class="flex-1 min-w-0">
                <p class="text-[10px] text-amber-400 font-medium">Replying to {{ replyingTo.senderName }}</p>
                <p class="text-xs text-slate-400 truncate">{{ replyingTo.body }}</p>
            </div>
            <button @click="$emit('cancel-reply')" class="p-1 rounded hover:bg-white/10 text-slate-500">✕</button>
        </div>

        <!-- Input area -->
        <div class="flex items-end gap-2 p-3">
            <!-- Attachment button -->
            <button class="p-2 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors" title="Attach file">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
            </button>

            <!-- Text input -->
            <div class="flex-1 relative">
                <textarea
                    ref="inputRef"
                    v-model="messageText"
                    @keydown="handleKeydown"
                    @input="handleInput"
                    placeholder="Type a message..."
                    rows="1"
                    class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition max-h-32 overflow-y-auto"
                />
            </div>

            <!-- Send button -->
            <button 
                @click="send"
                :disabled="!canSend"
                class="p-2.5 rounded-xl transition-all duration-300"
                :class="canSend 
                    ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20' 
                    : 'bg-white/5 text-slate-600 cursor-not-allowed'"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Message } from '../types'

interface Props {
    replyingTo?: Message | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
    send: [body: string, replyTo?: { id: string; preview: string }]
    typing: []
    'cancel-reply': []
}>()

const messageText = ref('')
const inputRef = ref<HTMLTextAreaElement | null>(null)

const canSend = computed(() => messageText.value.trim().length > 0)

function send() {
    if (!canSend.value) return
    const body = messageText.value.trim()
    const replyTo = props.replyingTo 
        ? { id: props.replyingTo.id, preview: props.replyingTo.body.substring(0, 80) }
        : undefined
    emit('send', body, replyTo)
    messageText.value = ''
    // Auto-resize back to 1 row
    if (inputRef.value) {
        inputRef.value.style.height = 'auto'
    }
}

function handleKeydown(e: KeyboardEvent) {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        send()
    }
}

function handleInput() {
    emit('typing')
    // Auto-resize textarea
    if (inputRef.value) {
        inputRef.value.style.height = 'auto'
        inputRef.value.style.height = `${inputRef.value.scrollHeight}px`
    }
}
</script>
