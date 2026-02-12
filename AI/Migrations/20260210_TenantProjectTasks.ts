import * as admin from 'firebase-admin';
import { Project } from '../../app/models/Project';
import { Goal } from '../../app/models/Goal';

/**
 * Migration: TenantProjectTasks
 * Model: Antigravity (Claude)
 * Date: 2026-02-10
 *
 * Purpose:
 * 1. Create `tenants/ilytat-hq` tenant document if it doesn't exist
 * 2. Migrate existing projects: `ownerId`/`ownerType` → `tenantId`/`createdBy`
 * 3. Seed a sample goal on the first active project
 */
export const runMigration = async (db: admin.firestore.Firestore) => {
    const logs: string[] = [];
    const log = (msg: string) => {
        console.log(msg);
        logs.push(msg);
    };

    log('Starting migration: 20260210_TenantProjectTasks');

    try {
        // ---------------------------------------------------------------
        // 1. Ensure tenant document exists
        // ---------------------------------------------------------------
        const tenantRef = db.doc('tenants/ilytat-hq');
        const tenantSnap = await tenantRef.get();

        if (!tenantSnap.exists) {
            await tenantRef.set({
                name: 'ILYTAT',
                domain: 'ilytat.com',
                logo: '',
                plan: 'pro',
                memberIds: [],
                quickLaunch: {
                    '🔥 Firebase': 'https://console.firebase.google.com/project/ilytat-structure/overview',
                    '✨ Gemini': 'https://gemini.google.com/'
                },
                createdAt: new Date(),
                updatedAt: new Date()
            });
            log('Created tenants/ilytat-hq tenant document.');
        } else {
            log('Tenant tenants/ilytat-hq already exists. Updating QuickLaunch.');
            await tenantRef.update({
                quickLaunch: {
                    '🔥 Firebase': 'https://console.firebase.google.com/project/ilytat-structure/overview',
                    '✨ Gemini': 'https://gemini.google.com/'
                },
                updatedAt: new Date()
            });
        }

        // ---------------------------------------------------------------
        // 2. Migrate projects: ownerId/ownerType → tenantId/createdBy
        // ---------------------------------------------------------------
        const projectsSnap = await db.collection('projects').get();
        let migratedCount = 0;

        for (const projectDoc of projectsSnap.docs) {
            const data = projectDoc.data();

            // Only migrate if still using legacy ownerId field
            if (data.ownerId && !data.tenantId) {
                await projectDoc.ref.update({
                    tenantId: data.ownerId,
                    createdBy: data.createdBy || '',
                    updatedAt: new Date()
                });
                migratedCount++;
                log(`Migrated project "${data.name}" (${projectDoc.id}): ownerId → tenantId`);
            }
        }

        log(`Migrated ${migratedCount}/${projectsSnap.size} projects.`);

        // ---------------------------------------------------------------
        // 3. Seed a sample goal on the first active project
        // ---------------------------------------------------------------
        const activeProjects = await db.collection('projects')
            .where('status', '==', 'active')
            .limit(1)
            .get();

        if (!activeProjects.empty) {
            const projectDoc = activeProjects.docs[0];
            if (projectDoc) {
                const projectId = projectDoc.id;
                const goalsRef = db.collection(`projects/${projectId}/goals`);

                // Check if goals subcollection is empty
                const existingGoals = await goalsRef.limit(1).get();

                if (existingGoals.empty) {
                    const goalData = new Goal({
                        title: 'Launch Internal Tooling v1',
                        description: 'Complete the first version of internal HQ tools for the team.',
                        status: 'in-progress',
                        createdBy: 'system',
                        targetDate: new Date(Date.now() + 30 * 86400000) // 30 days from now
                    }).toJSON();

                    const goalRef = await goalsRef.add(goalData);
                    log(`Created sample goal "${goalData.title}" (${goalRef.id}) in project ${projectId}`);
                } else {
                    log('Goals already exist in project. Skipping seed.');
                }
            }
        } else {
            log('No active projects found. Skipping goal seed.');
        }

        log('Migration completed successfully.');
        return { success: true, logs };

    } catch (error: any) {
        log(`Error during migration: ${error.message}`);
        return { success: false, logs, error: error.message };
    }
};
