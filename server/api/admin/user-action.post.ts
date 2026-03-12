/**
 * server/api/admin/user-action.post.ts
 * ─────────────────────────────────────
 * Handle user management actions: password reset email,
 * force-reset flag, and clearing the reset flag.
 *
 * Intent: Centralize user account actions behind a single endpoint
 * with an `action` discriminator for cleaner client-side code.
 */

import { defineEventHandler, readBody, createError } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { verifyAdminAccess, ensureAdminInitialized } from '../../utils/adminAuth'

export default defineEventHandler(async (event) => {
    await verifyAdminAccess(event)

    ensureAdminInitialized()
    const auth = getAuth()
    const db = getFirestore()

    const body = await readBody(event)
    const { uid, action } = body

    if (!uid || !action) {
        throw createError({ statusCode: 400, statusMessage: 'uid and action are required' })
    }

    try {
        const user = await auth.getUser(uid)

        switch (action) {
            case 'send-reset-email': {
                const link = await auth.generatePasswordResetLink(user.email!)
                return {
                    success: true,
                    message: `Password reset link generated for ${user.email}`,
                    link
                }
            }

            case 'force-reset': {
                const currentClaims = user.customClaims || {}
                await auth.setCustomUserClaims(uid, {
                    ...currentClaims,
                    forcePasswordReset: true
                })
                return {
                    success: true,
                    message: `Force password reset flag set for ${user.email}`
                }
            }

            case 'assign-tenant': {
                const { tenantId } = body
                if (!tenantId) throw createError({ statusCode: 400, statusMessage: 'tenantId is required' })

                await auth.setCustomUserClaims(uid, {
                    ...user.customClaims,
                    tenantId
                })

                // Also update the Firestore user doc
                await db.collection('users').doc(uid).set({
                    tenantId
                }, { merge: true })

                return {
                    success: true,
                    message: `User ${user.email} assigned to tenant ${tenantId}`
                }
            }

            case 'update-user': {
                const { employeeId, role, displayName, ...rest } = body

                const updates: any = {}
                if (displayName !== undefined) updates.displayName = displayName
                if (employeeId !== undefined) updates.employeeId = Number(employeeId)
                if (role !== undefined) {
                    await auth.setCustomUserClaims(uid, { ...user.customClaims, role })
                }

                if (Object.keys(updates).length > 0) {
                    await db.collection('users').doc(uid).set(updates, { merge: true })
                }

                return {
                    success: true,
                    message: `User ${user.email} updated successfully`
                }
            }

            case 'clear-reset-flag': {
                const currentClaims = user.customClaims || {}
                const { forcePasswordReset, ...remainingClaims } = currentClaims
                await auth.setCustomUserClaims(uid, remainingClaims)
                return {
                    success: true,
                    message: `Reset flag cleared for ${user.email}`
                }
            }

            default:
                throw createError({ statusCode: 400, statusMessage: `Unknown action: ${action}` })
        }
    } catch (e: any) {
        if (e.statusCode) throw e
        console.error('[API] User action failed:', e.message)
        throw createError({
            statusCode: 500,
            statusMessage: `User action failed: ${e.message}`
        })
    }
})
