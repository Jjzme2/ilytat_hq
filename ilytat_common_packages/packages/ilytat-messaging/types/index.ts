/**
 * Messaging Types — Enterprise-grade real-time messaging
 * 
 * Intent: Fully typed messaging system supporting direct messages, 
 * group conversations, typing indicators, read receipts, reactions,
 * and message status tracking. Designed for reuse across any ILYTAT app.
 */

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
export type MessageType = 'text' | 'system' | 'notification' | 'file' | 'image'
export type ConversationType = 'direct' | 'group' | 'project' | 'system'
export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline'

export interface Message {
    id: string
    conversationId: string
    senderUid: string
    senderName: string
    senderAvatar?: string

    // Content
    type: MessageType
    body: string
    metadata?: Record<string, any>

    // Status tracking
    status: MessageStatus
    readBy: string[]           // UIDs who have read the message
    deliveredTo: string[]      // UIDs the message has been delivered to

    // Reactions
    reactions: MessageReaction[]

    // Timestamps
    createdAt: Date
    updatedAt?: Date
    editedAt?: Date
    deletedAt?: Date           // Soft delete

    // Reply threading
    replyTo?: string           // ID of the message being replied to
    replyPreview?: string      // Preview text of the replied message
}

export interface MessageReaction {
    emoji: string
    userUid: string
    userName: string
    createdAt: Date
}

export interface Conversation {
    id: string
    type: ConversationType
    name?: string              // For group/project conversations

    // Participants
    participants: string[]     // UIDs
    participantNames: Record<string, string>  // uid -> display name
    participantAvatars?: Record<string, string>

    // Last message preview
    lastMessage?: {
        body: string
        senderUid: string
        senderName: string
        createdAt: Date
    }

    // Unread tracking per participant
    unreadCounts: Record<string, number>     // uid -> unread count

    // Typing indicators
    typingUsers: string[]      // UIDs currently typing

    // Project association
    projectId?: string
    tenantId?: string

    // Timestamps
    createdAt: Date
    updatedAt: Date

    // Configuration
    isMuted?: Record<string, boolean>   // uid -> muted status
    isPinned?: Record<string, boolean>  // uid -> pinned status
}

export interface TypingIndicator {
    conversationId: string
    userUid: string
    userName: string
    timestamp: Date
}

export interface UserPresence {
    uid: string
    status: PresenceStatus
    lastSeen: Date
    activeConversationId?: string
}
