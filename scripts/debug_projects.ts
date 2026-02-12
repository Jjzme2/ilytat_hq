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

async function debugProjects() {
    // 1. List all tenants to find IDs
    console.log('--- Tenants ---');
    const tenants = await db.collection('tenants').get();
    let targetTenantId = '';

    if (tenants.empty) {
        console.log('No tenants found.');
    } else {
        tenants.forEach(t => {
            console.log(`ID: ${t.id}, Data:`, t.data());
            // Assuming the first one found is relevant or specifically 'ilytat-hq'
            if (t.id === 'ilytat-hq') targetTenantId = t.id;
        });
        if (!targetTenantId && !tenants.empty) targetTenantId = tenants.docs[0].id;
    }

    if (!targetTenantId) {
        console.log('No target tenant ID found to query projects for.');
        return;
    }

    console.log(`\n--- Inspecting Projects for Tenant: ${targetTenantId} ---`);
    const projectsRef = db.collection(`tenants/${targetTenantId}/projects`);
    const allProjects = await projectsRef.get();

    if (allProjects.empty) {
        console.log('No projects found in this tenant subcollection.');
    } else {
        allProjects.forEach(doc => {
            console.log(`\nProject ID: ${doc.id}`);
            console.log(JSON.stringify(doc.data(), null, 2));
        });
    }

    console.log('\n--- Checking Root Projects (Should be empty if migrated) ---');
    const rootProjects = await db.collection('projects').get();
    console.log(`Root projects count: ${rootProjects.size}`);
    rootProjects.forEach(doc => {
        console.log(`Root Project ID: ${doc.id}`);
    });
}

debugProjects().catch(console.error);
