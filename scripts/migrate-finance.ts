/**
 * Finance Migration Script
 * 
 * Purpose: Migrates finance data from nested subcollections
 * (users/{userId}/accounts, /transactions, /budgets) to flattened
 * root-level collections (/accounts, /transactions, /budgets) with
 * proper scoping fields (ownerId, scope).
 * 
 * Model Used: Claude 4 Sonnet
 * 
 * Usage: Run via Firebase Admin SDK or Cloud Functions:
 *   npx ts-node scripts/migrate-finance.ts
 * 
 * WARNING: This is a one-time migration. Back up your database first.
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

// Initialize with service account
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json'
initializeApp({
    credential: cert(serviceAccountPath)
})

const db = getFirestore()
const BATCH_SIZE = 500

interface MigrationStats {
    accountsMigrated: number
    transactionsMigrated: number
    budgetsMigrated: number
    errors: string[]
}

async function migrateFinance(): Promise<MigrationStats> {
    const stats: MigrationStats = {
        accountsMigrated: 0,
        transactionsMigrated: 0,
        budgetsMigrated: 0,
        errors: []
    }

    console.log('📦 Starting finance data migration...')
    console.log('   Source: users/{userId}/accounts, /transactions, /budgets')
    console.log('   Target: /accounts, /transactions, /budgets (root)')
    console.log('')

    // Get all users
    const usersSnap = await db.collection('users').get()
    console.log(`Found ${usersSnap.size} users to process.`)

    for (const userDoc of usersSnap.docs) {
        const userId = userDoc.id
        const userData = userDoc.data()
        console.log(`\n👤 Processing user: ${userId} (${userData.email || 'no email'})`)

        // ---- Migrate Accounts ----
        try {
            const accountsSnap = await db.collection(`users/${userId}/accounts`).get()
            if (accountsSnap.size > 0) {
                let batch = db.batch()
                let batchCount = 0

                for (const accDoc of accountsSnap.docs) {
                    const data = accDoc.data()
                    const newDoc = db.collection('accounts').doc(accDoc.id)

                    batch.set(newDoc, {
                        ...data,
                        ownerId: userId,
                        scope: data.scope || 'personal',
                        tenantId: data.tenantId || null,
                        projectId: data.projectId || null,
                        financialViewers: data.financialViewers || [],
                        lastUpdated: data.lastUpdated || Timestamp.now()
                    })

                    batchCount++
                    stats.accountsMigrated++

                    if (batchCount >= BATCH_SIZE) {
                        await batch.commit()
                        batch = db.batch()
                        batchCount = 0
                    }
                }

                if (batchCount > 0) await batch.commit()
                console.log(`   ✅ Migrated ${accountsSnap.size} accounts`)
            }
        } catch (err: any) {
            const msg = `Error migrating accounts for ${userId}: ${err.message}`
            console.error(`   ❌ ${msg}`)
            stats.errors.push(msg)
        }

        // ---- Migrate Transactions ----
        try {
            const txSnap = await db.collection(`users/${userId}/transactions`).get()
            if (txSnap.size > 0) {
                let batch = db.batch()
                let batchCount = 0

                for (const txDoc of txSnap.docs) {
                    const data = txDoc.data()
                    const newDoc = db.collection('transactions').doc(txDoc.id)

                    batch.set(newDoc, {
                        ...data,
                        ownerId: userId,
                        scope: data.scope || 'personal',
                        tenantId: data.tenantId || null
                    })

                    batchCount++
                    stats.transactionsMigrated++

                    if (batchCount >= BATCH_SIZE) {
                        await batch.commit()
                        batch = db.batch()
                        batchCount = 0
                    }
                }

                if (batchCount > 0) await batch.commit()
                console.log(`   ✅ Migrated ${txSnap.size} transactions`)
            }
        } catch (err: any) {
            const msg = `Error migrating transactions for ${userId}: ${err.message}`
            console.error(`   ❌ ${msg}`)
            stats.errors.push(msg)
        }

        // ---- Migrate Budgets ----
        try {
            const budgetSnap = await db.collection(`users/${userId}/budgets`).get()
            if (budgetSnap.size > 0) {
                let batch = db.batch()
                let batchCount = 0

                for (const budgetDoc of budgetSnap.docs) {
                    const data = budgetDoc.data()
                    const newDoc = db.collection('budgets').doc(budgetDoc.id)

                    batch.set(newDoc, {
                        ...data,
                        ownerId: userId,
                        scope: data.scope || 'personal',
                        tenantId: data.tenantId || null,
                        spent: data.spent || 0
                    })

                    batchCount++
                    stats.budgetsMigrated++

                    if (batchCount >= BATCH_SIZE) {
                        await batch.commit()
                        batch = db.batch()
                        batchCount = 0
                    }
                }

                if (batchCount > 0) await batch.commit()
                console.log(`   ✅ Migrated ${budgetSnap.size} budgets`)
            }
        } catch (err: any) {
            const msg = `Error migrating budgets for ${userId}: ${err.message}`
            console.error(`   ❌ ${msg}`)
            stats.errors.push(msg)
        }
    }

    return stats
}

// Execute
migrateFinance()
    .then((stats) => {
        console.log('\n' + '='.repeat(50))
        console.log('📊 Migration Summary')
        console.log('='.repeat(50))
        console.log(`   Accounts:     ${stats.accountsMigrated}`)
        console.log(`   Transactions: ${stats.transactionsMigrated}`)
        console.log(`   Budgets:      ${stats.budgetsMigrated}`)
        if (stats.errors.length > 0) {
            console.log(`\n   ⚠️  ${stats.errors.length} errors:`)
            stats.errors.forEach(e => console.log(`      - ${e}`))
        } else {
            console.log('\n   ✅ All data migrated successfully!')
        }
        console.log('\n💡 Next step: Verify data in Firestore console, then delete nested subcollections.')
        process.exit(stats.errors.length > 0 ? 1 : 0)
    })
    .catch((err) => {
        console.error('Fatal migration error:', err)
        process.exit(1)
    })
