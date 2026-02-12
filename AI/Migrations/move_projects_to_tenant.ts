import { Firestore } from 'firebase-admin/firestore'
import { Auth } from 'firebase-admin/auth'

export const runMigration = async (db: Firestore, auth: Auth) => {
    const logs: string[] = []
    let success = true
    let error = null

    try {
        logs.push('Starting project migration (Root -> Tenant Subcollection)...')

        // Get all projects from root collection
        const rootProjectsSnapshot = await db.collection('projects').get()

        if (rootProjectsSnapshot.empty) {
            logs.push('No projects found in root collection. Nothing to migrate.')
            return {
                success: true,
                logs,
                error: null
            }
        }

        logs.push(`Found ${rootProjectsSnapshot.size} projects in root collection.`)

        const batch = db.batch()
        let batchCount = 0

        for (const projectDoc of rootProjectsSnapshot.docs) {
            const data = projectDoc.data()
            const projectId = projectDoc.id

            // Validate minimal data requirements
            if (!data.tenantId) {
                logs.push(`SKIPPING Project ${projectId}: Missing tenantId`)
                continue
            }

            // Prepare new location
            const newRef = db.doc(`tenants/${data.tenantId}/projects/${projectId}`)

            // Prepare data updates (ensure members)
            const memberUpdates: string[] = Array.isArray(data.members) ? [...data.members] : []
            if (data.createdBy && !memberUpdates.includes(data.createdBy)) {
                memberUpdates.push(data.createdBy)
            }

            const newData = {
                ...data,
                members: memberUpdates,
                _migratedAt: new Date(),
                _originalId: projectId
            }

            // Add to batch: Set new location, Delete old location
            batch.set(newRef, newData)
            batch.delete(projectDoc.ref)
            batchCount++

            logs.push(`  Migrating Project ${data.name} (${projectId}) -> tenants/${data.tenantId}/projects`)
        }

        if (batchCount > 0) {
            await batch.commit()
            logs.push(`Successfully migrated ${batchCount} projects.`)
        }

    } catch (e: any) {
        logs.push(`Migration failed: ${e.message}`)
        error = e.message
        success = false
    }

    return {
        success,
        logs,
        error
    }
}
