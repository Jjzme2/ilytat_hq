/**
 * types/index.ts
 * ─────────────
 * Shared type definitions re-exported from the admin panel layer.
 * The ilytat-admin-panel composables import `ActivityItem` and `UserProfile`
 * from `~/types`, which resolves to this file in the consuming app.
 *
 * Intent: Keep a single source of truth for cross-layer type contracts.
 */

export interface ActivityItem {
    id: string
    action: string
    module: string
    userId: string
    timestamp: any // Firestore Timestamp
    metadata?: Record<string, any>
}

export interface UserProfile {
    uid: string
    email: string | null
    displayName: string | null
    photoURL?: string | null
    role?: 'admin' | 'member' | 'viewer'
    roles?: ('admin' | 'member' | 'viewer')[]
    tenantId?: string
    createdAt: any // Firestore Timestamp | serverTimestamp()
}
