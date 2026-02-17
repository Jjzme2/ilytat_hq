<template>
    <button 
        @click="$emit('click')"
        class="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left group"
        :class="active 
            ? 'bg-amber-500/10 border border-amber-500/20' 
            : 'hover:bg-white/5 border border-transparent'"
    >
        <!-- Avatar -->
        <div class="relative flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-amber-400 uppercase">
            {{ initials }}
            <div v-if="hasUnread" class="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full border-2 border-black" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
                <h4 class="text-sm font-semibold truncate" :class="active ? 'text-amber-400' : 'text-white'">
                    {{ displayName }}
                </h4>
                <span v-if="conversation.lastMessage" class="text-[10px] text-slate-500 flex-shrink-0 ml-2">
                    {{ formatTime(conversation.lastMessage.createdAt) }}
                </span>
            </div>
            <div class="flex items-center gap-1 mt-0.5">
                <!-- Typing indicator -->
                <span v-if="isTyping" class="text-xs text-amber-400 italic">typing...</span>
                <!-- Last message preview -->
                <p v-else class="text-xs truncate" :class="hasUnread ? 'text-slate-300 font-medium' : 'text-slate-500'">
                    {{ conversation.lastMessage?.body || 'No messages yet' }}
                </p>
                <!-- Unread badge -->
                <span v-if="unreadCount > 0" class="flex-shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black px-1">
                    {{ unreadCount > 99 ? '99+' : unreadCount }}
                </span>
            </div>
        </div>
    </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCurrentUser } from 'vuefire'
import type { Conversation } from '../types'

interface Props {
    conversation: Conversation
    active: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ click: [] }>()

const user = useCurrentUser()

const displayName = computed(() => {
    if (props.conversation.name) return props.conversation.name
    if (!user.value) return 'Unknown'
    // For DMs, show the other participant's name
    const otherNames = Object.entries(props.conversation.participantNames || {})
        .filter(([uid]) => uid !== user.value!.uid)
        .map(([, name]) => name)
    return otherNames.join(', ') || 'Unknown'
})

const initials = computed(() => {
    return displayName.value.split(' ').map(w => w[0]).join('').substring(0, 2)
})

const unreadCount = computed(() => {
    if (!user.value) return 0
    return props.conversation.unreadCounts?.[user.value.uid] || 0
})

const hasUnread = computed(() => unreadCount.value > 0)

const isTyping = computed(() => {
    if (!user.value) return false
    return props.conversation.typingUsers
        ?.filter(uid => uid !== user.value!.uid)
        ?.length > 0
})

function formatTime(date: any): string {
    if (!date) return ''
    const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60000) return 'now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>
