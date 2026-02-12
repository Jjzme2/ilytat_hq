import * as admin from 'firebase-admin';
import { User } from '../../app/models/User';
import { UserPreference } from '../../app/models/UserPreference';
import { Project } from '../../app/models/Project';
import { Task } from '../../app/models/Task';
import { Document } from '../../app/models/Document';
import { Quote } from '../../app/models/Quote';
import { InboxMessage } from '../../app/models/InboxMessage';

export const runMigration = async (db: admin.firestore.Firestore, auth: admin.auth.Auth) => {
    const logs: string[] = [];
    const log = (msg: string) => {
        console.log(msg);
        logs.push(msg);
    };

    log('Starting migration: 20260210_InitialSeed (Admin SDK)');

    try {
        // 1. Create/Update Core Users
        const usersToSeed = [
            {
                email: 'zettler.jj@ilytat.com',
                displayName: 'Jjzme2',
                roles: ['admin', 'super', 'user'],
                tenantId: 'ilytat-hq',
                bio: 'Founder',
                photoURL: ''
            },
            {
                email: 'zettler.nicoleee@ilytat.com',
                displayName: 'Nicole',
                roles: ['admin', 'user'],
                tenantId: 'ilytat-hq',
                bio: 'Studio Admin',
                photoURL: ''
            }
        ];

        let jjUserId = '';

        for (const userData of usersToSeed) {
            const usersRef = db.collection('users');
            const q = usersRef.where('email', '==', userData.email);
            const querySnapshot = await q.get();

            let userId = '';

            // Sync with Firestore
            if (!querySnapshot.empty && querySnapshot.docs[0]) {
                userId = querySnapshot.docs[0].id;
                log(`User ${userData.email} already exists (ID: ${userId}). Updating...`);
                await usersRef.doc(userId).set({
                    ...userData,
                    uid: userId,
                    updatedAt: new Date()
                }, { merge: true });
            } else {
                log(`Creating new user ${userData.email} in Firestore...`);
                const newUserRef = await usersRef.add({
                    ...userData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                userId = newUserRef.id;
                await usersRef.doc(userId).update({ uid: userId });
            }

            if (userData.email === 'zettler.jj@ilytat.com') jjUserId = userId;

            // Sync with Auth (Claims)
            try {
                const authUser = await auth.getUserByEmail(userData.email);
                log(`Setting custom claims for ${userData.email} (Auth ID: ${authUser.uid})...`);
                await auth.setCustomUserClaims(authUser.uid, {
                    role: userData.roles.includes('super') ? 'super' : 'admin',
                    tenantId: userData.tenantId
                });
            } catch (authErr) {
                log(`Warning: Could not set auth claims for ${userData.email}. Ensure user exists in Firebase Auth.`);
            }
        }

        // 2. Create User Subcollections (only for JJ for sample data)
        if (jjUserId) {
            log(`Provisioning sample data for JJ (${jjUserId})...`);

            // Preferences
            const prefsRef = db.doc(`users/${jjUserId}/preferences/default`);
            const prefsSnapshot = await prefsRef.get();
            if (!prefsSnapshot.exists) {
                const prefs = new UserPreference({
                    theme: 'dark',
                    notifications: true,
                    dashboardLayout: { default: 'grid' }
                });
                await prefsRef.set(prefs.toJSON());
                log(`Set preferences for user ${jjUserId}`);
            }

            // Daily (Quotes)
            const today = new Date().toISOString().split('T')[0];
            const dailyRef = db.doc(`users/${jjUserId}/daily/${today}`);
            const dailySnapshot = await dailyRef.get();
            if (!dailySnapshot.exists) {
                const quote = new Quote({
                    text: 'Keep going, no matter what.',
                    author: 'Reginald Lewis',
                    source: 'https://reginaldflewis.com/',
                    tags: ['perseverance'],
                    type: 'common',
                    userId: 'system',
                    date: today
                });
                await dailyRef.set(quote.toJSON());
                log(`Set daily quote for ${today}`);
            }

            // Inbox Welcome Message
            const inboxRef = db.collection(`users/${jjUserId}/inbox`);
            const inboxSnapshot = await inboxRef.limit(1).get();
            if (inboxSnapshot.empty) {
                const welcomeMsg = new InboxMessage({
                    subject: 'Welcome to ILYTAT HQ',
                    body: 'This is your first message in the new system.',
                    from: 'System',
                    fromId: 'system',
                    to: jjUserId,
                    read: false,
                    priority: 'high',
                    type: 'system_notification'
                });
                await inboxRef.add(welcomeMsg.toJSON());
                log('Added welcome message to inbox');
            }
        }

        // 3. Create Sample Project (Tenant Level)
        const projectsRef = db.collection('projects');
        const projectData = {
            name: 'Internal Tooling',
            description: 'Development and maintenance of internal HQ tools.',
            status: 'active',
            tenantId: 'ilytat-hq',
            association: 'company'
        };

        const pq = projectsRef.where('name', '==', 'Internal Tooling').where('tenantId', '==', 'ilytat-hq');
        const pSnapshot = await pq.get();

        let projectId = '';
        if (!pSnapshot.empty) {
            projectId = pSnapshot.docs[0].id;
            log('Sample project already exists.');
        } else {
            const pRef = await projectsRef.add({
                ...projectData,
                createdAt: new Date(),
                members: [jjUserId]
            });
            projectId = pRef.id;
            log(`Created sample project: Internal Tooling (${projectId})`);
        }

        // 4. Create Sample Task (if JJ exists)
        if (jjUserId && projectId) {
            const tasksRef = db.collection('tasks');
            const tq = tasksRef.where('title', '==', 'Verify migration').where('tenantId', '==', 'ilytat-hq');
            const tSnapshot = await tq.get();

            if (tSnapshot.empty) {
                const taskData = {
                    title: 'Verify migration',
                    isCompleted: false,
                    dueDate: new Date(Date.now() + 86400000), // Tomorrow
                    assigneeId: jjUserId,
                    tenantId: 'ilytat-hq',
                    projectId: projectId
                };
                await tasksRef.add(new Task(taskData).toJSON());
                log('Created sample task.');
            }
        }

        // 5. Create Placeholder Document
        const docsRef = db.collection('documents');
        const dq = docsRef.where('title', '==', 'System Architecture v1');
        const dSnapshot = await dq.get();

        if (dSnapshot.empty) {
            const docData = {
                title: 'System Architecture v1',
                url: 'https://r2.ilytat.com/docs/arch-v1.pdf',
                storageKey: 'docs/arch-v1.pdf',
                mimeType: 'application/pdf',
                size: 1024 * 1024 * 2, // 2MB
                metadata: { version: '1.0', author: 'Jjzme2' },
                tenantId: 'ilytat-hq'
            };
            await docsRef.add(new Document(docData).toJSON());
            log('Created placeholder document.');
        }

        log('Migration completed successfully.');
        return { success: true, logs };

    } catch (error: any) {
        log(`Error during migration: ${error.message}`);
        return { success: false, logs, error: error.message };
    }
};
