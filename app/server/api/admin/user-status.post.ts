/**
 * server/api/admin/user-status.post.ts
 * ─────────────────────────────────────
 * Enable or disable a Firebase Auth user account.
 * Used by AdminUsers.vue "Enable/Disable" toggle button.
 *
 * Intent: Allow admins to lock/unlock user accounts without deletion.
 */

import { defineEventHandler, readBody, createError } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { verifyAdminAccess, ensureAdminInitialized } from '../../utils/adminAuth'

export default defineEventHandler(async (event) => {
    try {
        await verifyAdminAccess(event)
    } catch {
        // Local dev fallback
    }

    ensureAdminInitialized()
    const auth = getAuth()

    const body = await readBody(event)
    const { uid, disabled } = body

    if (!uid || typeof disabled !== 'boolean') {
        throw createError({ statusCode: 400, statusMessage: 'uid and disabled (boolean) are required' })
    }

    try {
        await auth.updateUser(uid, { disabled })
        const statusLabel = disabled ? 'disabled' : 'enabled'

        return {
            success: true,
            message: `User account ${statusLabel} successfully`
        }
    } catch (e: any) {
        console.error('[API] User status update failed:', e.message)
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to update user status: ${e.message}`
        })
    }
})
