import { defineEventHandler, readBody, createError } from 'h3'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { verifyAdminAccess, ensureAdminInitialized } from '../../utils/adminAuth'

export default defineEventHandler(async (event) => {
    try {
        await verifyAdminAccess(event)
    } catch (e: any) {
        throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
    }

    ensureAdminInitialized()
    const db = getFirestore()

    const body = await readBody(event)
    const { model, data, tenantId = 'ilytat-hq' } = body

    if (!model || !data) {
        throw createError({ statusCode: 400, statusMessage: 'model and data are required' })
    }

    // Map model names to collections
    const collectionMap: Record<string, string> = {
        'User': 'users',
        'Project': 'projects',
        'Task': 'tasks',
        'Goal': 'goals',
        'Note': 'notes',
        'Document': 'documents'
    }

    const collectionName = collectionMap[model]
    if (!collectionName) {
        throw createError({ statusCode: 400, statusMessage: `Unknown model: ${model}` })
    }

    try {
        // Enforce tenantId for non-user models if not provided
        const payload = {
            ...data,
            tenantId: data.tenantId || tenantId,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        }

        // Special handling for shared entities or subcollections if needed
        const docRef = await db.collection(collectionName).add(payload)

        // Update with ID
        await docRef.update({ id: docRef.id })

        return {
            success: true,
            id: docRef.id,
            model: model,
            message: `Successfully seeded ${model} (${docRef.id})`
        }
    } catch (e: any) {
        console.error(`[Seed Wizard Error] ${model}:`, e)
        throw createError({
            statusCode: 500,
            statusMessage: `Seeding failed: ${e.message}`
        })
    }
})
