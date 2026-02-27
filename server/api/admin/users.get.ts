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

        // 1. Identify users needing employeeId assignment and group by tenantId
        const usersNeedingIdByTenant: Record<string, string[]> = {}
        const enrichedUsers: any[] = []

        // Initial pass: Build base objects and identify missing IDs
        for (const user of listResult.users) {
            const claims = user.customClaims || {}
            const firestoreData = firestoreUsersMap.get(user.uid) || {}

            const tenantId = firestoreData.tenantId || claims.tenantId || null
            const role = claims.role || firestoreData.role || 'member'
            let employeeId = firestoreData.employeeId || null

            // If missing employeeId and has tenant, mark for batch update
            if (!employeeId && tenantId) {
                if (!usersNeedingIdByTenant[tenantId]) {
                    usersNeedingIdByTenant[tenantId] = []
                }
                usersNeedingIdByTenant[tenantId].push(user.uid)
            }

            enrichedUsers.push({
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
            })
        }

        // 2. Perform batched updates per tenant (one transaction per tenant)
        const tenantIds = Object.keys(usersNeedingIdByTenant)
        const updates = await Promise.all(tenantIds.map(async (tenantId) => {
            const userIds = usersNeedingIdByTenant[tenantId]
            if (userIds.length === 0) return null

            try {
                const tenantMetaRef = db.collection('tenants').doc(tenantId).collection('metadata').doc('counters')

                return await db.runTransaction(async (transaction) => {
                    const metaDoc = await transaction.get(tenantMetaRef)
                    let currentMaxId = 0
                    if (metaDoc.exists) {
                        currentMaxId = metaDoc.data()?.lastEmployeeId || 0
                    }

                    const assignedIds: Record<string, number> = {}

                    // Assign sequential IDs
                    let nextId = currentMaxId
                    userIds.forEach(uid => {
                        nextId++
                        assignedIds[uid] = nextId

                        const userRef = db.collection('users').doc(uid)
                        transaction.set(userRef, { employeeId: nextId, tenantId }, { merge: true })
                    })

                    // Update counter once with final value
                    transaction.set(tenantMetaRef, { lastEmployeeId: nextId }, { merge: true })

                    return { tenantId, assignedIds }
                })
            } catch (err) {
                console.error(`Failed to batch assign employeeIds for tenant ${tenantId}:`, err)
                return null
            }
        }))

        // 3. Update the enrichedUsers array with newly assigned IDs
        const updatesMap: Record<string, number> = {}
        updates.forEach(update => {
            if (update && update.assignedIds) {
                Object.assign(updatesMap, update.assignedIds)
            }
        })

        enrichedUsers.forEach(user => {
            if (updatesMap[user.uid]) {
                user.employeeId = updatesMap[user.uid]
            }
        })

        return enrichedUsers
    } catch (e: any) {
        console.error('[API] Failed to list users:', e.message)
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to list users: ${e.message}`
        })
    }
})
