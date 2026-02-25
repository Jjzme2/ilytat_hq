/**
 * query_db.ts — Quick script to dump sample documents from every collection.
 * Run: npx tsx scripts/query_db.ts
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL!;
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

initializeApp({
    credential: cert({ projectId: projectId || 'ilytat-structure', clientEmail, privateKey })
});

const db = getFirestore();

const COLLECTIONS = [
    'users',
    'tenants',
    'projects',
    'tasks',
    'goals',
    'documents',
    'events',
    'notes',
    'quotes',
    'accounts',
    'transactions',
    'budgets',
    'invitations',
    'timelogs',
];

async function main() {
    for (const col of COLLECTIONS) {
        console.log(`\n========== ${col.toUpperCase()} ==========`);
        const snap = await db.collection(col).limit(2).get();
        if (snap.empty) {
            console.log('  (empty collection)');
            continue;
        }
        for (const doc of snap.docs) {
            console.log(`  [${doc.id}]`, JSON.stringify(doc.data(), null, 2));
        }
    }

    // Also check tenant subcollections (if tenants exist)
    const tenants = await db.collection('tenants').limit(1).get();
    if (!tenants.empty) {
        const tenantId = tenants.docs[0]!.id;
        console.log(`\n========== TENANT ${tenantId} SUBCOLLECTIONS ==========`);
        for (const sub of ['projects', 'members']) {
            const subSnap = await db.collection(`tenants/${tenantId}/${sub}`).limit(2).get();
            console.log(`  --- ${sub} ---`);
            if (subSnap.empty) {
                console.log('    (empty)');
            } else {
                for (const d of subSnap.docs) {
                    console.log(`    [${d.id}]`, JSON.stringify(d.data(), null, 2));
                }
            }
        }
    }

    // Check user subcollections
    const users = await db.collection('users').limit(1).get();
    if (!users.empty) {
        const userId = users.docs[0]!.id;
        console.log(`\n========== USER ${userId} SUBCOLLECTIONS ==========`);
        for (const sub of ['preferences', 'daily', 'inbox', 'conversations']) {
            const subSnap = await db.collection(`users/${userId}/${sub}`).limit(1).get();
            console.log(`  --- ${sub} ---`);
            if (subSnap.empty) {
                console.log('    (empty)');
            } else {
                for (const d of subSnap.docs) {
                    console.log(`    [${d.id}]`, JSON.stringify(d.data(), null, 2));
                }
            }
        }
    }

    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
