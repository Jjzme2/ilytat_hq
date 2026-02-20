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
    // SECURITY: Strictly enforce admin access. Do not catch errors here.
    await verifyAdminAccess(event)

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

        const enrichedUsers = await Promise.all(listResult.users.map(async user => {
            const claims = user.customClaims || {}
            const firestoreData = firestoreUsersMap.get(user.uid) || {}

            // Priority: Firestore > Claims > Default
            const tenantId = firestoreData.tenantId || claims.tenantId || null
            const role = claims.role || firestoreData.role || 'member'
            let employeeId = firestoreData.employeeId || null

            // Auto-assign employeeId if missing and we have a tenant
            if (!employeeId && tenantId) {
                try {
                    const tenantMetaRef = db.collection('tenants').doc(tenantId).collection('metadata').doc('counters')
                    await db.runTransaction(async (transaction) => {
                        const metaDoc = await transaction.get(tenantMetaRef)
                        let nextId = 1
                        if (metaDoc.exists) {
                            nextId = (metaDoc.data()?.lastEmployeeId || 0) + 1
                        }
                        transaction.set(tenantMetaRef, { lastEmployeeId: nextId }, { merge: true })

                        // Update user doc in transaction
                        const userRef = db.collection('users').doc(user.uid)
                        transaction.set(userRef, { employeeId: nextId, tenantId }, { merge: true })
                        employeeId = nextId
                    })
                } catch (err) {
                    console.error(`Failed to auto-assign employeeId for ${user.uid}:`, err)
                }
            }

            return {
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
        }))

        return enrichedUsers
    } catch (e: any) {
        console.error('[API] Failed to list users:', e.message)
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to list users: ${e.message}`
        })
    }
})
