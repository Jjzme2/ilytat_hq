import { defineEventHandler, readBody, createError } from 'h3'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { verifyAdminAccess, ensureAdminInitialized } from '../../utils/adminAuth'
import path from 'node:path'

export default defineEventHandler(async (event) => {
    try {
        await verifyAdminAccess(event)
    } catch (e: any) {
        throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
    }

    ensureAdminInitialized()
    const db = getFirestore()
    const auth = getAuth()

    const body = await readBody(event)
    const { migrationId, force = false } = body

    if (!migrationId) {
        throw createError({ statusCode: 400, statusMessage: 'migrationId is required' })
    }

    try {
        // Check if already executed
        const migrationRef = db.collection('_migrations').doc(migrationId)
        const migrationDoc = await migrationRef.get()

        if (migrationDoc.exists && !force) {
            return {
                success: false,
                message: 'Migration already executed. Use force to re-run.',
                alreadyExecuted: true
            }
        }

        // Dynamically import the migration file
        // Note: In Nuxt/Nitro, we might need a specific path or handling for dynammic imports
        // AI/Migrations is in the root, so we resolve from process.cwd()
        const migrationPath = path.resolve(process.cwd(), `AI/Migrations/${migrationId}.ts`)

        // Use dynamic import
        const migrationModule = await import(migrationPath)

        if (typeof migrationModule.runMigration !== 'function') {
            throw new Error(`Migration ${migrationId} does not export a runMigration function`)
        }

        const result = await migrationModule.runMigration(db, auth)

        if (result.success) {
            await migrationRef.set({
                executedAt: FieldValue.serverTimestamp(),
                logs: result.logs || []
            }, { merge: true })
        }

        return {
            success: result.success,
            logs: result.logs,
            error: result.error
        }
    } catch (e: any) {
        console.error(`[Migration Error] ${migrationId}:`, e)
        throw createError({
            statusCode: 500,
            statusMessage: `Migration failed: ${e.message}`
        })
    }
})
