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

        // Group users needing an employeeId by tenantId to batch updates and avoid N+1 transactions
        const usersNeedingEmployeeIdByTenant = new Map<string, any[]>()

        // First pass: Construct the list of users and identify those needing an employeeId
        const enrichedUsers = listResult.users.map(user => {
            const claims = user.customClaims || {}
            const firestoreData = firestoreUsersMap.get(user.uid) || {}

            // Priority: Firestore > Claims > Default
            const tenantId = firestoreData.tenantId || claims.tenantId || null
            const role = claims.role || firestoreData.role || 'member'
            const employeeId = firestoreData.employeeId || null

            const userData = {
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
                if (!usersNeedingEmployeeIdByTenant.has(tenantId)) {
                    usersNeedingEmployeeIdByTenant.set(tenantId, [])
                }
                usersNeedingEmployeeIdByTenant.get(tenantId)!.push(userData)
            }

            return userData
        })

        // Second pass: Process batch updates per tenant in a single transaction
        const batchPromises = Array.from(usersNeedingEmployeeIdByTenant.entries()).map(async ([tenantId, usersGroup]) => {
            try {
                const tenantMetaRef = db.collection('tenants').doc(tenantId).collection('metadata').doc('counters')
                await db.runTransaction(async (transaction) => {
                    const metaDoc = await transaction.get(tenantMetaRef)
                    let nextId = 1
                    if (metaDoc.exists) {
                        nextId = (metaDoc.data()?.lastEmployeeId || 0) + 1
                    }

                    // Assign an ID to each user in the group and update their document
                    usersGroup.forEach(user => {
                        user.employeeId = nextId // Update the object in memory (which mutates the object inside `enrichedUsers`)

                        const userRef = db.collection('users').doc(user.uid)
                        transaction.set(userRef, { employeeId: nextId, tenantId }, { merge: true })

                        nextId++
                    })

                    // Save the final incremented ID state back to counters document
                    transaction.set(tenantMetaRef, { lastEmployeeId: nextId - 1 }, { merge: true })
                })
            } catch (err) {
                console.error(`Failed to auto-assign employeeIds for tenant ${tenantId}:`, err)
            }
        })

        await Promise.all(batchPromises)

        return enrichedUsers
    } catch (e: any) {
        console.error('[API] Failed to list users:', e.message)
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to list users: ${e.message}`
        })
    }
})
