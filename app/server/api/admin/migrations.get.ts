import { defineEventHandler, createError } from 'h3'
import fs from 'node:fs/promises'
import path from 'node:path'
import { verifyAdminAccess, ensureAdminInitialized } from '../../utils/adminAuth'
import { getFirestore } from 'firebase-admin/firestore'

export default defineEventHandler(async (event) => {
    try {
        await verifyAdminAccess(event)
    } catch (e: any) {
        // Fallback for local dev if needed, but usually we want this strictly guarded
        throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
    }

    ensureAdminInitialized()
    const db = getFirestore()

    try {
        const migrationsDir = path.resolve(process.cwd(), 'AI/Migrations')
        const files = await fs.readdir(migrationsDir)

        // Filter for .ts or .js files
        const migrationFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.js'))

        // Get execution history from Firestore
        const historySnap = await db.collection('_migrations').get()
        const historyMap = new Map()
        historySnap.docs.forEach(doc => {
            historyMap.set(doc.id, doc.data())
        })

        const migrations = migrationFiles.map(file => {
            const name = file.replace(/\.(ts|js)$/, '')
            const version = name.split('_')[0] // Assuming format YYYYMMDD_Name
            const executedInfo = historyMap.get(name)

            return {
                id: name,
                file: file,
                version: version,
                label: name.split('_').slice(1).join(' ').replace(/([A-Z])/g, ' $1').trim(),
                executed: !!executedInfo,
                executedAt: executedInfo?.executedAt?.toDate() || null
            }
        }).sort((a, b) => {
            const versionA = a.version || ''
            const versionB = b.version || ''
            return versionB.localeCompare(versionA)
        })

        return migrations
    } catch (e: any) {
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to list migrations: ${e.message}`
        })
    }
})
