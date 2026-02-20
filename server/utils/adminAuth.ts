/**
 * server/utils/adminAuth.ts
 * ─────────────────────────
 * Shared utility for Firebase Admin authentication in server API routes.
 * Initializes Firebase Admin SDK once and provides helper to verify
 * Bearer tokens from authenticated requests.
 *
 * Intent: DRY — every admin API route needs token verification.
 */

import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getHeader, createError } from 'h3'
import type { H3Event } from 'h3'

/**
 * Ensure Firebase Admin SDK is initialized.
 * Safe to call multiple times — only initializes once.
 */
export const ensureAdminInitialized = () => {
    const apps = getApps()
    if (apps.length) {
        const appNames = apps.map(app => app.name)
        console.log('[Firebase Admin] Apps already exist:', appNames)
        if (appNames.includes('[DEFAULT]')) {
            return getApp()
        }
    }

    const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n')
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    const projectId = process.env.FIREBASE_PROJECT_ID

    if (!privateKey || !clientEmail || !projectId) {
        console.warn('[Firebase Admin] Missing manual credentials, relying on GOOGLE_APPLICATION_CREDENTIALS')
        try {
            return initializeApp()
        } catch (e: any) {
            console.error('[Firebase Admin] Manual credentials missing AND default init failed:', e.message)
            throw createError({
                statusCode: 500,
                statusMessage: 'Firebase Admin credentials not configured'
            })
        }
    }

    try {
        return initializeApp({
            credential: cert({ projectId, clientEmail, privateKey })
        })
    } catch (e: any) {
        if (e.code === 'app/duplicate-app') {
            return getApp()
        } else {
            console.error('[Firebase Admin] Initialization failed:', e)
            throw e
        }
    }
}

/**
 * Extract and verify the Bearer token from an incoming request.
 */
export const verifyAdminToken = async (event: H3Event) => {
    ensureAdminInitialized()
    const auth = getAuth()

    const authHeader = getHeader(event, 'authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
        throw createError({ statusCode: 401, statusMessage: 'No auth token provided' })
    }

    try {
        const decoded = await auth.verifyIdToken(token)
        return decoded
    } catch (e: any) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid auth token' })
    }
}

/**
 * Verify token AND check that the user has admin privileges.
 */
export const verifyAdminAccess = async (event: H3Event) => {
    const decoded = await verifyAdminToken(event)

    // Robust role check (supports both role: string and roles: string[])
    const hasAdminRole = decoded.role === 'admin'
        || decoded.role === 'super'
        || decoded.roles?.includes('admin')
        || decoded.roles?.includes('super')
        || decoded.admin === true

    const isIlytatHq = decoded.tenantId === 'ilytat-hq'

    // Security: Removed hardcoded admin emails/UIDs. Access is now strictly role-based.
    const isAdmin = (hasAdminRole && isIlytatHq)

    if (!isAdmin) {
        throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
    }

    return {
        ...decoded,
        isSuper: (decoded.role === 'super' || decoded.roles?.includes('super')) && isIlytatHq
    }
}
