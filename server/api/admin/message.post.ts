import { defineEventHandler, readBody, createError } from 'h3'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { verifyAdminAccess, ensureAdminInitialized } from '../../utils/adminAuth'

export default defineEventHandler(async (event) => {
    // SECURITY: Strictly enforce admin access.
    const adminUser = await verifyAdminAccess(event)

    ensureAdminInitialized()
    const db = getFirestore()

    const body = await readBody(event)
    const { uid, message, type = 'admin-broadcast' } = body

    if (!uid || !message) {
        throw createError({ statusCode: 400, statusMessage: 'uid and message are required' })
    }

    try {
        // Find recipient tenant details if needed, or just send to UID
        // We'll store this in a global 'messages' collection
        const messageData = {
            recipientUid: uid,
            senderUid: adminUser.uid,
            content: message,
            type: type,
            status: 'unread',
            createdAt: FieldValue.serverTimestamp(),
            isSystem: true
        }

        const docRef = await db.collection('messages').add(messageData)

        // Log as activity
        await db.collection('activity_logs').add({
            type: 'admin_message',
            uid: adminUser.uid,
            targetUid: uid,
            content: `Sent admin message: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
            timestamp: FieldValue.serverTimestamp()
        })

        return {
            success: true,
            messageId: docRef.id
        }
    } catch (e: any) {
        console.error('[API] Send message failed:', e.message)
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to send message: ${e.message}`
        })
    }
})
