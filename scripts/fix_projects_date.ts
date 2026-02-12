import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!serviceAccount) {
    console.error('GOOGLE_APPLICATION_CREDENTIALS not set');
    process.exit(1);
}

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

const db = getFirestore();

async function fixDates() {
    console.log('--- Fixing Missing dates ---');
    // Hardcoding tenant for speed, but could iterate
    const tenantId = 'ilytat-hq';
    const projectsRef = db.collection(`tenants/${tenantId}/projects`);
    const snapshot = await projectsRef.get();

    if (snapshot.empty) {
        console.log('No projects found.');
        return;
    }

    const batch = db.batch();
    let count = 0;

    snapshot.forEach(doc => {
        const data = doc.data();
        let updates: any = {};

        if (!data.updatedAt) {
            console.log(`Fixing updatedAt for ${doc.id}`);
            updates.updatedAt = data.createdAt || new Date();
        }

        // Also ensure createdAt exists
        if (!data.createdAt) {
            console.log(`Fixing createdAt for ${doc.id}`);
            updates.createdAt = new Date();
        }

        if (Object.keys(updates).length > 0) {
            batch.update(doc.ref, updates);
            count++;
        }
    });

    if (count > 0) {
        await batch.commit();
        console.log(`Updated ${count} projects.`);
    } else {
        console.log('No projects needed updates.');
    }
}

fixDates().catch(console.error);
