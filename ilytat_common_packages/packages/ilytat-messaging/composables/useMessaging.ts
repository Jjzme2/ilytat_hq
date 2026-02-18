/**
 * useMessaging — Enterprise-grade real-time messaging composable
 * 
 * Intent: Provides a complete messaging layer with real-time message sync,
 * typing indicators, read receipts, reactions, and conversation management.
 * Designed as a standalone composable for reuse across ILYTAT applications.
 * 
 * Uses root Firestore collections: /conversations, /messages
 */
import { ref, computed, watch, onUnmounted } from 'vue'
import { useCurrentUser, useFirestore, useCollection } from 'vuefire'
import {
    collection, query, where, addDoc, updateDoc, deleteDoc, doc,
    Timestamp, orderBy, onSnapshot, arrayUnion, arrayRemove,
    serverTimestamp, increment, limit, writeBatch
} from 'firebase/firestore'
import type { Message, Conversation, MessageType, ConversationType, MessageReaction } from '../types'

// Typing indicator debounce interval (ms)
const TYPING_DEBOUNCE = 2000

export const useMessaging = () => {
    const user = useCurrentUser()
    const db = useFirestore()

    // --- REACTIVE STATE ---
    const activeConversationId = ref<string | null>(null)
    const activeMessages = ref<Message[]>([])
    const typingTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
    const messageListeners: (() => void)[] = []
    const conversationsLimit = ref(20)

    // --- CONVERSATIONS ---
    const conversations = useCollection<Conversation>(
        computed(() => {
            if (!user.value) return null
            return query(
                collection(db, 'conversations'),
                where('participants', 'array-contains', user.value.uid),
                orderBy('updatedAt', 'desc'),
                limit(conversationsLimit.value)
            )
        }),
        { ssrKey: 'messaging-conversations' }
    )

    function loadMoreConversations() {
        conversationsLimit.value += 20
    }

    const totalUnread = computed(() => {
        if (!user.value) return 0
        return conversations.value.reduce((sum, c) => {
            return sum + (c.unreadCounts?.[user.value!.uid] || 0)
        }, 0)
    })

    const pinnedConversations = computed(() => {
        if (!user.value) return []
        return conversations.value.filter(c => c.isPinned?.[user.value!.uid])
    })

    // --- MESSAGE LOADING ---
    function loadMessages(conversationId: string, messageLimit: number = 50) {
        // Clean up previous listener
        clearMessageListeners()
        activeConversationId.value = conversationId
        activeMessages.value = []

        const messagesQuery = query(
            collection(db, 'messages'),
            where('conversationId', '==', conversationId),
            orderBy('createdAt', 'asc'),
            limit(messageLimit)
        )

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            activeMessages.value = snapshot.docs.map(d => {
                const data = d.data()
                return {
                    ...data,
                    id: d.id,
                    createdAt: data.createdAt?.toDate?.() || new Date(),
                    updatedAt: data.updatedAt?.toDate?.() || undefined,
                    editedAt: data.editedAt?.toDate?.() || undefined,
                    deletedAt: data.deletedAt?.toDate?.() || undefined,
                    reactions: (data.reactions || []).map((r: any) => ({
                        ...r,
                        createdAt: r.createdAt?.toDate?.() || new Date()
                    }))
                } as Message
            })

            // Mark messages as read when loaded
            markConversationRead(conversationId)
        })

        messageListeners.push(unsubscribe)
    }

    function clearMessageListeners() {
        messageListeners.forEach(unsub => unsub())
        messageListeners.length = 0
    }

    // --- SEND MESSAGE ---
    async function sendMessage(
        conversationId: string,
        body: string,
        type: MessageType = 'text',
        replyTo?: { id: string; preview: string }
    ): Promise<string> {
        if (!user.value) throw new Error('User not authenticated')
        if (!body.trim()) throw new Error('Message body cannot be empty')

        const messageData: Omit<Message, 'id'> = {
            conversationId,
            senderUid: user.value.uid,
            senderName: user.value.displayName || user.value.email || 'Unknown',
            senderAvatar: user.value.photoURL || undefined,
            type,
            body: body.trim(),
            status: 'sent',
            readBy: [user.value.uid],
            deliveredTo: [user.value.uid],
            reactions: [],
            createdAt: new Date(),
            replyTo: replyTo?.id,
            replyPreview: replyTo?.preview
        }

        // Add message
        const msgRef = await addDoc(collection(db, 'messages'), {
            ...messageData,
            createdAt: serverTimestamp(),
            // Also set recipientUid and senderId for backward compatibility with inbox
            recipientUid: null,
            senderId: user.value.uid
        })

        // Update conversation's last message and increment unread for other participants
        const convRef = doc(db, 'conversations', conversationId)
        const conv = conversations.value.find(c => c.id === conversationId)
        if (conv) {
            const unreadUpdates: Record<string, any> = {}
            conv.participants
                .filter(uid => uid !== user.value!.uid)
                .forEach(uid => {
                    unreadUpdates[`unreadCounts.${uid}`] = increment(1)
                })

            await updateDoc(convRef, {
                lastMessage: {
                    body: body.trim().substring(0, 100),
                    senderUid: user.value.uid,
                    senderName: user.value.displayName || user.value.email || 'Unknown',
                    createdAt: serverTimestamp()
                },
                updatedAt: serverTimestamp(),
                typingUsers: arrayRemove(user.value.uid),
                ...unreadUpdates
            })
        }

        // Stop typing indicator
        stopTyping(conversationId)

        return msgRef.id
    }

    // --- EDIT MESSAGE ---
    async function editMessage(messageId: string, newBody: string) {
        if (!user.value) return
        await updateDoc(doc(db, 'messages', messageId), {
            body: newBody.trim(),
            editedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        })
    }

    // --- DELETE MESSAGE (soft) ---
    async function deleteMessage(messageId: string) {
        if (!user.value) return
        await updateDoc(doc(db, 'messages', messageId), {
            deletedAt: serverTimestamp(),
            body: 'This message was deleted.',
            updatedAt: serverTimestamp()
        })
    }

    // --- REACTIONS ---
    async function addReaction(messageId: string, emoji: string) {
        if (!user.value) return
        const reaction: MessageReaction = {
            emoji,
            userUid: user.value.uid,
            userName: user.value.displayName || 'Unknown',
            createdAt: new Date()
        }
        await updateDoc(doc(db, 'messages', messageId), {
            reactions: arrayUnion({
                ...reaction,
                createdAt: Timestamp.now()
            })
        })
    }

    async function removeReaction(messageId: string, emoji: string) {
        if (!user.value) return
        // Find and remove the reaction from the array
        const msg = activeMessages.value.find(m => m.id === messageId)
        if (!msg) return
        const existing = msg.reactions.find(
            r => r.emoji === emoji && r.userUid === user.value!.uid
        )
        if (existing) {
            await updateDoc(doc(db, 'messages', messageId), {
                reactions: arrayRemove(existing)
            })
        }
    }

    // --- READ RECEIPTS ---
    async function markConversationRead(conversationId: string) {
        if (!user.value) return
        const convRef = doc(db, 'conversations', conversationId)
        await updateDoc(convRef, {
            [`unreadCounts.${user.value.uid}`]: 0
        })
    }

    async function markMessageRead(messageId: string) {
        if (!user.value) return
        await updateDoc(doc(db, 'messages', messageId), {
            readBy: arrayUnion(user.value.uid),
            deliveredTo: arrayUnion(user.value.uid),
            status: 'read'
        })
    }

    // --- TYPING INDICATORS ---
    async function startTyping(conversationId: string) {
        if (!user.value) return
        const convRef = doc(db, 'conversations', conversationId)
        await updateDoc(convRef, {
            typingUsers: arrayUnion(user.value.uid)
        })

        // Auto-stop after debounce
        if (typingTimeout.value) clearTimeout(typingTimeout.value)
        typingTimeout.value = setTimeout(() => {
            stopTyping(conversationId)
        }, TYPING_DEBOUNCE)
    }

    async function stopTyping(conversationId: string) {
        if (!user.value) return
        if (typingTimeout.value) {
            clearTimeout(typingTimeout.value)
            typingTimeout.value = null
        }
        const convRef = doc(db, 'conversations', conversationId)
        await updateDoc(convRef, {
            typingUsers: arrayRemove(user.value.uid)
        })
    }

    // --- CONVERSATION MANAGEMENT ---
    async function createConversation(
        participantUids: string[],
        participantNames: Record<string, string>,
        type: ConversationType = 'direct',
        options?: { name?: string; projectId?: string; tenantId?: string }
    ): Promise<string> {
        if (!user.value) throw new Error('User not authenticated')

        // Ensure current user is in participants
        const allParticipants = [...new Set([user.value.uid, ...participantUids])]

        const convData: Omit<Conversation, 'id'> = {
            type,
            name: options?.name || (type === 'direct' ? null : 'New Group'),
            participants: allParticipants,
            participantNames: {
                ...participantNames,
                [user.value.uid]: user.value.displayName || user.value.email || 'Unknown'
            },
            unreadCounts: Object.fromEntries(allParticipants.map(uid => [uid, 0])),
            typingUsers: [],
            projectId: options?.projectId || null,
            tenantId: options?.tenantId || null,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        const convRef = await addDoc(collection(db, 'conversations'), {
            ...convData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        })

        return convRef.id
    }

    async function muteConversation(conversationId: string, muted: boolean) {
        if (!user.value) return
        await updateDoc(doc(db, 'conversations', conversationId), {
            [`isMuted.${user.value.uid}`]: muted
        })
    }

    async function pinConversation(conversationId: string, pinned: boolean) {
        if (!user.value) return
        await updateDoc(doc(db, 'conversations', conversationId), {
            [`isPinned.${user.value.uid}`]: pinned
        })
    }

    // --- CLEANUP ---
    onUnmounted(() => {
        clearMessageListeners()
        if (typingTimeout.value) clearTimeout(typingTimeout.value)
    })

    return {
        // State
        conversations,
        activeConversationId,
        activeMessages,
        totalUnread,
        pinnedConversations,

        // Message operations
        loadMessages,
        sendMessage,
        editMessage,
        deleteMessage,

        // Reactions
        addReaction,
        removeReaction,

        // Read receipts
        markConversationRead,
        markMessageRead,

        // Typing
        startTyping,
        stopTyping,

        // Conversations
        createConversation,
        muteConversation,
        pinConversation,
        loadMoreConversations
    }
}
