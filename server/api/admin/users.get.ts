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

        // Initial map to collect basic data and identify users needing employeeIds
        const parsedUsers = listResult.users.map(user => {
            const claims = user.customClaims || {}
            const firestoreData = firestoreUsersMap.get(user.uid) || {}

            // Priority: Firestore > Claims > Default
            const tenantId = firestoreData.tenantId || claims.tenantId || null
            const role = claims.role || firestoreData.role || 'member'
            const employeeId = firestoreData.employeeId || null

            return { user, claims, firestoreData, tenantId, role, employeeId }
        })

        // Group users missing employeeIds by tenant to optimize transactions
        const missingIdsByTenant = new Map<string, typeof parsedUsers>()
        for (const u of parsedUsers) {
            if (!u.employeeId && u.tenantId) {
                if (!missingIdsByTenant.has(u.tenantId)) {
                    missingIdsByTenant.set(u.tenantId, [])
                }
                missingIdsByTenant.get(u.tenantId)!.push(u)
            }
        }

        // Perform a single transaction per tenant for all missing employeeIds
        await Promise.all(Array.from(missingIdsByTenant.entries()).map(async ([tenantId, group]) => {
            try {
                const tenantMetaRef = db.collection('tenants').doc(tenantId).collection('metadata').doc('counters')
                await db.runTransaction(async (transaction) => {
                    const metaDoc = await transaction.get(tenantMetaRef)
                    let nextId = 1
                    if (metaDoc.exists) {
                        nextId = (metaDoc.data()?.lastEmployeeId || 0) + 1
                    }

                    // Increment the counter once by the total number of IDs needed
                    transaction.set(tenantMetaRef, { lastEmployeeId: nextId + group.length - 1 }, { merge: true })

                    // Update all users in the group within the same transaction
                    for (const u of group) {
                        const userRef = db.collection('users').doc(u.user.uid)
                        transaction.set(userRef, { employeeId: nextId, tenantId }, { merge: true })
                        u.employeeId = nextId // Update local state
                        nextId++
                    }
                })
            } catch (err) {
                console.error(`Failed to auto-assign employeeIds for tenant ${tenantId}:`, err)
            }
        }))

        // Map the final enriched user data
        const enrichedUsers = parsedUsers.map(u => ({
            uid: u.user.uid,
            email: u.user.email || '',
            displayName: u.user.displayName || u.firestoreData.displayName || '',
            role: u.role,
            tenantId: u.tenantId,
            employeeId: u.employeeId,
            lastSignInTime: u.user.metadata.lastSignInTime || '',
            creationTime: u.user.metadata.creationTime || '',
            disabled: u.user.disabled,
            forcePasswordReset: u.claims.forcePasswordReset || false,
            photoURL: u.user.photoURL || u.firestoreData.photoURL || ''
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
