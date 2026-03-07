/**
 * server/api/admin/invite.post.ts
 * ────────────────────────────────
 * Create a new Firebase Auth user and set their role via custom claims.
 * Used by AdminUsers.vue "Send Invite" button.
 *
 * Intent: Allow admins to provision new user accounts.
 */

import { defineEventHandler, readBody, createError } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { verifyAdminAccess, ensureAdminInitialized } from '../../utils/adminAuth'

export default defineEventHandler(async (event) => {
    await verifyAdminAccess(event)

    ensureAdminInitialized()
    const auth = getAuth()

    const body = await readBody(event)
    const { email, role = 'member' } = body

    if (!email) {
        throw createError({ statusCode: 400, statusMessage: 'Email is required' })
    }

    try {
        // Create the user with a temporary password
        const tempPassword = `Temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

        const newUser = await auth.createUser({
            email,
            password: tempPassword,
            emailVerified: false
        })

        // Set custom claims for role
        await auth.setCustomUserClaims(newUser.uid, { role })

        // Generate password reset link so user can set their own password
        const resetLink = await auth.generatePasswordResetLink(email)

        return {
            success: true,
            message: `User ${email} created with role "${role}". Reset link generated.`,
            uid: newUser.uid,
            resetLink
        }
    } catch (e: any) {
        console.error('[API] Failed to invite user:', e.message)
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to create user: ${e.message}`
        })
    }
})
