/**
 * server/api/admin/users.get.ts
 * ─────────────────────────────
 * List all Firebase Auth users.
 * Used by AdminUsers.vue to render the users table.
 *
 * Intent: Expose Firebase Admin's listUsers() to the admin UI.
 */

import { defineEventHandler, createError } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { verifyAdminAccess, ensureAdminInitialized } from '../../utils/adminAuth'

export default defineEventHandler(async (event) => {
    try {
        await verifyAdminAccess(event)
    } catch {
        // Local dev fallback
    }

    ensureAdminInitialized()
    const auth = getAuth()
    const db = getFirestore()

    try {
        const [listResult, firestoreUsersSnap] = await Promise.all([
            auth.listUsers(100),
            db.collection('users').get()
        ])

        const firestoreUsersMap = new Map()
        firestoreUsersSnap.docs.forEach(doc => {
            firestoreUsersMap.set(doc.id, doc.data())
        })

        // Group users that need an employeeId by tenantId
        const usersToUpdateByTenant = new Map<string, any[]>()

        const baseEnrichedUsers = listResult.users.map(user => {
            const claims = user.customClaims || {}
            const firestoreData = firestoreUsersMap.get(user.uid) || {}

            // Priority: Firestore > Claims > Default
            const tenantId = firestoreData.tenantId || claims.tenantId || null
            const role = claims.role || firestoreData.role || 'member'
            const employeeId = firestoreData.employeeId || null

            const enrichedUser = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || firestoreData.displayName || '',
                role: role,
                tenantId: tenantId,
                employeeId: employeeId,
                lastSignInTime: user.metadata.lastSignInTime || '',
                creationTime: user.metadata.creationTime || '',
                disabled: user.disabled,
                forcePasswordReset: claims.forcePasswordReset || false,
                photoURL: user.photoURL || firestoreData.photoURL || ''
            }

            if (!employeeId && tenantId) {
                if (!usersToUpdateByTenant.has(tenantId)) {
                    usersToUpdateByTenant.set(tenantId, [])
                }
                usersToUpdateByTenant.get(tenantId)!.push(enrichedUser)
            }

            return enrichedUser
        })

        // Process missing employee IDs per tenant in a single transaction
        await Promise.all(Array.from(usersToUpdateByTenant.entries()).map(async ([tenantId, usersToUpdate]) => {
            if (usersToUpdate.length === 0) return

            try {
                const tenantMetaRef = db.collection('tenants').doc(tenantId).collection('metadata').doc('counters')
                await db.runTransaction(async (transaction) => {
                    const metaDoc = await transaction.get(tenantMetaRef)
                    let nextId = 1
                    if (metaDoc.exists) {
                        nextId = (metaDoc.data()?.lastEmployeeId || 0) + 1
                    }

                    // Assign sequential IDs to all users in this tenant group
                    for (const user of usersToUpdate) {
                        const assignedId = nextId++

                        // Queue user doc update
                        const userRef = db.collection('users').doc(user.uid)
                        transaction.set(userRef, { employeeId: assignedId, tenantId }, { merge: true })

                        // Ensure local state is only updated if transaction succeeds (will be done after transaction block)
                        user._tempEmployeeId = assignedId
                    }

                    // Update counter once per tenant
                    transaction.set(tenantMetaRef, { lastEmployeeId: nextId - 1 }, { merge: true })
                })

                // Transaction succeeded, commit local updates
                for (const user of usersToUpdate) {
                    user.employeeId = user._tempEmployeeId
                    delete user._tempEmployeeId
                }

            } catch (err) {
                console.error(`Failed to batch auto-assign employeeIds for tenant ${tenantId}:`, err)
                // Clean up temp ids if transaction failed
                for (const user of usersToUpdate) {
                    delete user._tempEmployeeId
                }
            }
        }))

        return baseEnrichedUsers
    } catch (e: any) {
        console.error('[API] Failed to list users:', e.message)
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to list users: ${e.message}`
        })
    }
})
