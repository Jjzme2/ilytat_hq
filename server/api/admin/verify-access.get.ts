/**
 * server/api/admin/verify-access.get.ts
 * ──────────────────────────────────────
 * Verifies that the current user has admin access.
 * Called by the admin panel page on mount to gate the UI.
 *
 * Intent: Server-side authorization check so the admin panel
 * never renders for non-admin users.
 */

import { defineEventHandler } from 'h3'
import { verifyAdminAccess } from '../../utils/adminAuth'

export default defineEventHandler(async (event) => {
    const decoded = await verifyAdminAccess(event)
    return {
        access: true,
        verifiedAt: new Date().toISOString(),
        role: 'admin',
        uid: decoded.uid
    }
})
