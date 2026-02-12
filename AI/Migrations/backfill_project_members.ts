import { Firestore } from 'firebase-admin/firestore'
import { Auth } from 'firebase-admin/auth'

export const runMigration = async (db: Firestore, auth: Auth) => {
    const logs: string[] = []
    let success = true
    let error = null

    try {
        logs.push('Starting project members backfill...')

        // Get all tenants
        const tenantsSnapshot = await db.collection('tenants').get()

        for (const tenantDoc of tenantsSnapshot.docs) {
            const tenantId = tenantDoc.id
            logs.push(`Processing tenant: ${tenantId}`)

            const projectsRef = db.collection(`tenants/${tenantId}/projects`)
            const projectsSnapshot = await projectsRef.get()

            if (projectsSnapshot.empty) {
                logs.push(`  No projects found for tenant ${tenantId}`)
                continue
            }

            const batch = db.batch()
            let batchCount = 0

            for (const projectDoc of projectsSnapshot.docs) {
                const data = projectDoc.data()

                // Check if members array exists and has the creator/owner
                // We'll use the 'createdBy' field if available, otherwise fallback to a known admin or just skip
                // For now, let's assume 'createdBy' is the UID we want to ensure is in members

                const memberUpdates: string[] = Array.isArray(data.members) ? [...data.members] : []
                let needsUpdate = false

                // 1. Ensure 'createdBy' is in members
                if (data.createdBy && !memberUpdates.includes(data.createdBy)) {
                    memberUpdates.push(data.createdBy)
                    needsUpdate = true
                    logs.push(`  Adding createdBy (${data.createdBy}) to members for project ${projectDoc.id}`)
                }

                // 2. Fallback: If no members and no createdBy, try to infer from somewhere or just log warning
                // In this specific user case, they are likely the 'owner' of the tenant or the one who created it.
                // If 'createdBy' is missing, we might use a specific user ID if we knew it, but let's stick to data we have.

                if (needsUpdate) {
                    batch.update(projectDoc.ref, { members: memberUpdates })
                    batchCount++
                }
            }

            if (batchCount > 0) {
                await batch.commit()
                logs.push(`  Committed ${batchCount} updates for tenant ${tenantId}`)
            } else {
                logs.push(`  No updates needed for tenant ${tenantId}`)
            }
        }

        logs.push('Migration completed successfully')
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
