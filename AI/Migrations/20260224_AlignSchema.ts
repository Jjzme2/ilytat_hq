/**
 * Migration: AlignSchema
 * Model: Claude Sonnet 4 (Antigravity)
 * Date: 2026-02-24
 *
 * Purpose:
 * Align Firestore documents with the new schema:
 * 1. Users: Add subscriberTier, rename tenantId → organizationId
 * 2. Tasks: Remove tenantId, add ownerId from createdBy
 * 3. Goals: Remove tenantId, add ownerId from createdBy
 * 4. Notes: Remove tenantId
 * 5. Events: Remove tenantId, ensure members[] exists
 * 6. Projects: Fix ownerId where it's a tenantId, ensure members[] populated
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL!;
const projectId = process.env.FIREBASE_PROJECT_ID || 'ilytat-structure';

initializeApp({
    credential: cert({ projectId, clientEmail, privateKey })
});

const db = getFirestore();

/** Known admin user UID — used as fallback ownerId */
const ADMIN_UID = 'BoHGcwh2ApNQiJJIgjZWBC9hY8I3';

const logs: string[] = [];
const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
};

async function migrateUsers() {
    log('\n=== MIGRATING USERS ===');
    const snap = await db.collection('users').get();
    let count = 0;

    for (const doc of snap.docs) {
        const data = doc.data();
        const updates: Record<string, any> = {};

        // Add subscriberTier if missing
        if (!('subscriberTier' in data)) {
            updates.subscriberTier = null;
        }
        if (!('subscriberTierExpiresAt' in data)) {
            updates.subscriberTierExpiresAt = null;
        }

        // Rename tenantId → organizationId
        if ('tenantId' in data && !('organizationId' in data)) {
            updates.organizationId = data.tenantId;
            updates.tenantId = FieldValue.delete();
        }

        if (Object.keys(updates).length > 0) {
            await doc.ref.update(updates);
            count++;
            log(`  Updated user ${doc.id} (${data.email || data.displayName})`);
        }
    }

    log(`  Migrated ${count}/${snap.size} users`);
}

async function migrateTasks() {
    log('\n=== MIGRATING TASKS ===');
    const snap = await db.collection('tasks').get();
    let count = 0;

    for (const doc of snap.docs) {
        const data = doc.data();
        const updates: Record<string, any> = {};

        // Remove tenantId
        if ('tenantId' in data) {
            updates.tenantId = FieldValue.delete();
        }

        // Add ownerId from createdBy (or fallback to admin)
        if (!('ownerId' in data) || !data.ownerId) {
            updates.ownerId = data.createdBy || data.assigneeId || ADMIN_UID;
        }

        if (Object.keys(updates).length > 0) {
            await doc.ref.update(updates);
            count++;
            log(`  Updated task ${doc.id} ("${data.title?.substring(0, 40)}...")`);
        }
    }

    log(`  Migrated ${count}/${snap.size} tasks`);
}

async function migrateGoals() {
    log('\n=== MIGRATING GOALS ===');
    const snap = await db.collection('goals').get();
    let count = 0;

    for (const doc of snap.docs) {
        const data = doc.data();
        const updates: Record<string, any> = {};

        // Remove tenantId
        if ('tenantId' in data) {
            updates.tenantId = FieldValue.delete();
        }

        // Add ownerId from createdBy
        if (!('ownerId' in data) || !data.ownerId) {
            updates.ownerId = data.createdBy || ADMIN_UID;
        }

        if (Object.keys(updates).length > 0) {
            await doc.ref.update(updates);
            count++;
            log(`  Updated goal ${doc.id} ("${data.title}")`);
        }
    }

    log(`  Migrated ${count}/${snap.size} goals`);
}

async function migrateNotes() {
    log('\n=== MIGRATING NOTES ===');
    const snap = await db.collection('notes').get();
    let count = 0;

    for (const doc of snap.docs) {
        const data = doc.data();
        const updates: Record<string, any> = {};

        // Remove tenantId
        if ('tenantId' in data) {
            updates.tenantId = FieldValue.delete();
        }

        if (Object.keys(updates).length > 0) {
            await doc.ref.update(updates);
            count++;
            log(`  Updated note ${doc.id} ("${data.title}")`);
        }
    }

    log(`  Migrated ${count}/${snap.size} notes`);
}

async function migrateEvents() {
    log('\n=== MIGRATING EVENTS ===');
    const snap = await db.collection('events').get();
    let count = 0;

    for (const doc of snap.docs) {
        const data = doc.data();
        const updates: Record<string, any> = {};

        // Remove tenantId
        if ('tenantId' in data) {
            updates.tenantId = FieldValue.delete();
        }

        // Ensure members[] exists with at least the creator
        if (!Array.isArray(data.members) || data.members.length === 0) {
            updates.members = [data.userId || ADMIN_UID];
        }

        if (Object.keys(updates).length > 0) {
            await doc.ref.update(updates);
            count++;
            log(`  Updated event ${doc.id} ("${data.title}")`);
        }
    }

    log(`  Migrated ${count}/${snap.size} events`);
}

async function migrateProjects() {
    log('\n=== MIGRATING PROJECTS ===');
    const snap = await db.collection('projects').get();
    let count = 0;

    for (const doc of snap.docs) {
        const data = doc.data();
        const updates: Record<string, any> = {};

        // Fix ownerId where it's a tenant slug instead of a user UID
        // (e.g. ownerId: 'ilytat-hq' should become the actual user UID)
        if (data.ownerId && data.ownerId.includes('-') && data.ownerId.length < 20) {
            // Looks like a tenant slug, not a UID
            updates.ownerId = data.createdBy || ADMIN_UID;
            log(`  Fixed bad ownerId "${data.ownerId}" → "${updates.ownerId}" for project ${doc.id}`);
        }

        // Remove ownerType if present
        if ('ownerType' in data) {
            updates.ownerType = FieldValue.delete();
        }

        // Remove tenantId if present
        if ('tenantId' in data) {
            updates.tenantId = FieldValue.delete();
        }

        // Ensure members[] exists and includes the owner
        const effectiveOwner = updates.ownerId || data.ownerId || data.createdBy || ADMIN_UID;
        if (!Array.isArray(data.members) || data.members.length === 0) {
            updates.members = [effectiveOwner];
        } else if (!data.members.includes(effectiveOwner)) {
            updates.members = [...data.members, effectiveOwner];
        }

        if (Object.keys(updates).length > 0) {
            await doc.ref.update(updates);
            count++;
            log(`  Updated project ${doc.id} ("${data.name}")`);
        }
    }

    log(`  Migrated ${count}/${snap.size} projects`);
}

async function migrateAccounts() {
    log('\n=== MIGRATING ACCOUNTS ===');
    const snap = await db.collection('accounts').get();
    let count = 0;

    for (const doc of snap.docs) {
        const data = doc.data();
        const updates: Record<string, any> = {};

        // Remove tenantId if present
        if ('tenantId' in data) {
            updates.tenantId = FieldValue.delete();
        }

        if (Object.keys(updates).length > 0) {
            await doc.ref.update(updates);
            count++;
            log(`  Updated account ${doc.id} ("${data.name}")`);
        }
    }

    log(`  Migrated ${count}/${snap.size} accounts`);
}

async function main() {
    log('🚀 Starting schema alignment migration (20260224_AlignSchema)');
    log(`  Target project: ${projectId}`);
    log(`  Admin fallback UID: ${ADMIN_UID}`);

    await migrateUsers();
    await migrateTasks();
    await migrateGoals();
    await migrateNotes();
    await migrateEvents();
    await migrateProjects();
    await migrateAccounts();

    log('\n✅ Migration completed successfully');
    log(`  Total operations logged: ${logs.length}`);

    process.exit(0);
}

main().catch(e => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
});
