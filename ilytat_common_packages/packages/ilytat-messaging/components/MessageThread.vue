<template>
    <div class="flex flex-col h-full">
        <!-- Messages container -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
            <!-- Date separators + messages -->
            <template v-for="(msg, i) in messages" :key="msg.id">
                <!-- Date separator -->
                <div v-if="shouldShowDate(msg, i)" class="flex items-center gap-3 my-4">
                    <div class="flex-1 h-px bg-white/10" />
                    <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {{ formatDate(msg.createdAt) }}
                    </span>
                    <div class="flex-1 h-px bg-white/10" />
                </div>

                <!-- Message bubble -->
                <div 
                    class="flex gap-2 group"
                    :class="isOwn(msg) ? 'flex-row-reverse' : ''"
                >
                    <!-- Avatar (other user) -->
                    <div v-if="!isOwn(msg) && shouldShowAvatar(msg, i)" 
                        class="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-amber-400 uppercase mt-auto"
                    >
                        {{ msg.senderName.substring(0, 2) }}
                    </div>
                    <div v-else-if="!isOwn(msg)" class="w-8 flex-shrink-0" />

                    <!-- Bubble -->
                    <div class="max-w-[70%] min-w-[80px]">
                        <!-- Sender name for group chats -->
                        <p v-if="!isOwn(msg) && shouldShowAvatar(msg, i)" class="text-[10px] font-medium text-slate-500 mb-1 px-1">
                            {{ msg.senderName }}
                        </p>

                        <!-- Reply preview -->
                        <div v-if="msg.replyTo" class="px-3 py-1.5 mb-1 rounded-t-lg bg-white/5 border-l-2 border-amber-500/30">
                            <p class="text-[10px] text-slate-400 truncate">{{ msg.replyPreview || 'Original message' }}</p>
                        </div>

                        <!-- Deleted message -->
                        <div v-if="msg.deletedAt" class="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/5">
                            <p class="text-xs text-slate-500 italic">🚫 This message was deleted</p>
                        </div>

                        <!-- Normal message -->
                        <div v-else 
                            class="px-4 py-2.5 rounded-2xl text-sm transition-all"
                            :class="isOwn(msg) 
                                ? 'bg-amber-500/15 text-amber-100 rounded-br-sm' 
                                : 'bg-white/5 text-white border border-white/5 rounded-bl-sm'"
                        >
                            <p class="whitespace-pre-wrap break-words leading-relaxed">{{ msg.body }}</p>
                        </div>

                        <!-- Message meta -->
                        <div class="flex items-center gap-2 mt-0.5 px-1"
                            :class="isOwn(msg) ? 'justify-end' : 'justify-start'"
                        >
                            <span class="text-[10px] text-slate-600">{{ formatTime(msg.createdAt) }}</span>
                            <span v-if="msg.editedAt" class="text-[10px] text-slate-600 italic">(edited)</span>
                            <!-- Read status for own messages -->
                            <span v-if="isOwn(msg)" class="text-[10px]"
                                :class="msg.readBy?.length > 1 ? 'text-amber-400' : 'text-slate-600'"
                            >
                                {{ msg.readBy?.length > 1 ? '✓✓' : '✓' }}
                            </span>
                        </div>

                        <!-- Reactions -->
                        <div v-if="msg.reactions?.length" class="flex flex-wrap gap-1 mt-1 px-1">
                            <button v-for="(reaction, ri) in groupedReactions(msg)" :key="ri"
                                @click="$emit('toggle-reaction', msg.id, reaction.emoji)"
                                class="px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition"
                                :class="reaction.hasOwn ? 'border-amber-500/30' : ''"
                            >
                                {{ reaction.emoji }} <span class="text-[10px] text-slate-400 ml-0.5">{{ reaction.count }}</span>
                            </button>
                        </div>
                    </div>

                    <!-- Context menu (hover) -->
                    <div class="flex items-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button @click="$emit('reply', msg)" class="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white text-xs" title="Reply">↩</button>
                        <button @click="$emit('react', msg)" class="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white text-xs" title="React">😊</button>
                    </div>
                </div>
            </template>
        </div>

        <!-- Typing indicator -->
        <div v-if="typingUsers.length > 0" class="px-4 py-2 text-xs text-amber-400/60 italic">
            {{ typingText }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useCurrentUser } from 'vuefire'
import type { Message } from '../types'

interface Props {
    messages: Message[]
    typingUsers: string[]
    participantNames: Record<string, string>
}

const props = defineProps<Props>()
const emit = defineEmits<{
    reply: [msg: Message]
    react: [msg: Message]
    'toggle-reaction': [messageId: string, emoji: string]
}>()

const user = useCurrentUser()
const messagesContainer = ref<HTMLElement | null>(null)

const isOwn = (msg: Message) => msg.senderUid === user.value?.uid

const typingText = computed(() => {
    const names = props.typingUsers
        .filter(uid => uid !== user.value?.uid)
        .map(uid => props.participantNames[uid] || 'Someone')
    if (names.length === 0) return ''
    if (names.length === 1) return `${names[0]} is typing...`
    return `${names.join(', ')} are typing...`
})

function shouldShowDate(msg: Message, index: number): boolean {
    if (index === 0) return true
    const prev = props.messages[index - 1]
    if (!prev) return true
    const prevDate = prev.createdAt instanceof Date ? prev.createdAt : new Date(prev.createdAt)
    const curDate = msg.createdAt instanceof Date ? msg.createdAt : new Date(msg.createdAt)
    return prevDate.toDateString() !== curDate.toDateString()
}

function shouldShowAvatar(msg: Message, index: number): boolean {
    if (index === 0) return true
    const prev = props.messages[index - 1]
    return !prev || prev.senderUid !== msg.senderUid
}

function groupedReactions(msg: Message) {
    const map = new Map<string, { emoji: string; count: number; hasOwn: boolean }>()
    for (const r of msg.reactions || []) {
        const existing = map.get(r.emoji) || { emoji: r.emoji, count: 0, hasOwn: false }
        existing.count++
        if (r.userUid === user.value?.uid) existing.hasOwn = true
        map.set(r.emoji, existing)
    }
    return [...map.values()]
}

function formatDate(date: any): string {
    const d = date instanceof Date ? date : new Date(date)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) return 'Today'
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}

function formatTime(date: any): string {
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

// Auto-scroll to bottom on new messages
watch(() => props.messages.length, async () => {
    await nextTick()
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
})
</script>
