/**
 * server/utils/adminAuth.ts
 * ─────────────────────────
 * Shared utility for Firebase Admin authentication in server API routes.
 * Initializes Firebase Admin SDK once and provides helper to verify
 * Bearer tokens from authenticated requests.
 *
 * Intent: DRY — every admin API route needs token verification.
 */

import { initializeApp, getApps, cert, getApp, deleteApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getHeader, createError } from 'h3'
import type { H3Event } from 'h3'

/** Module-level flag: once we've validated/fixed the app, skip re-checking. */
let _adminValidated = false

/**
 * Ensure Firebase Admin SDK is initialized with VALID credentials.
 *
 * WHY the complexity? nuxt-vuefire initializes the [DEFAULT] admin app
 * at BUILD TIME using the private key from nuxt.config.ts. If that key
 * was malformed (e.g. wrapped in literal double-quotes from Heroku),
 * the app exists but every Firestore call fails with:
 *   "DECODER routines::unsupported"
 *
 * This function detects the bad key, DELETES VueFire's broken app,
 * and re-initializes with the sanitized key from process.env.
 */
export const ensureAdminInitialized = () => {
    // Fast path: already validated on a previous call.
    if (_adminValidated && getApps().length) {
        return getApp()
    }

    // Sanitize the private key from the runtime environment.
    const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || ''
    const privateKey = rawKey
        .replace(/^"|"$/g, '')    // Strip surrounding quotes (Heroku paste artifact)
        .replace(/\\n/g, '\n')

    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    const projectId = process.env.FIREBASE_PROJECT_ID

    // Diagnostic logging (safe — BEGIN/END headers are not sensitive)
    console.log('[Firebase Admin] Key diagnostics:', {
        rawKeyLength: rawKey.length,
        cleanedKeyLength: privateKey.length,
        startsWithQuote: rawKey.startsWith('"'),
        endsWithQuote: rawKey.endsWith('"'),
        startsWithBegin: privateKey.trimStart().startsWith('-----BEGIN'),
        endsWithEnd: privateKey.trimEnd().endsWith('-----'),
        rawFirst30: rawKey.substring(0, 30),
        rawLast30: rawKey.substring(rawKey.length - 30),
        cleanedFirst30: privateKey.substring(0, 30),
        first5CharCodes: [...rawKey.substring(0, 5)].map(c => c.charCodeAt(0)),
        hasClientEmail: !!clientEmail,
        hasProjectId: !!projectId,
    })

    // If VueFire already created a [DEFAULT] app AND the raw key has quotes,
    // the existing app is broken — delete it so we can re-init with the clean key.
    const existingApps = getApps()
    if (existingApps.length) {
        const defaultApp = existingApps.find(a => a.name === '[DEFAULT]')
        if (defaultApp && rawKey.startsWith('"')) {
            console.warn('[Firebase Admin] Detected quoted private key — deleting broken VueFire app and re-initializing.')
            try { deleteApp(defaultApp) } catch { /* ignore */ }
        } else if (defaultApp) {
            // Key looks fine, VueFire's app should be usable.
            _adminValidated = true
            return defaultApp
        }
    }

    if (!privateKey || !clientEmail || !projectId) {
        console.warn('[Firebase Admin] Missing credentials, relying on GOOGLE_APPLICATION_CREDENTIALS')
        try {
            const app = initializeApp()
            _adminValidated = true
            return app
        } catch (e: any) {
            console.error('[Firebase Admin] Default init failed:', e.message)
            throw createError({
                statusCode: 500,
                statusMessage: 'Firebase Admin credentials not configured'
            })
        }
    }

    try {
        const app = initializeApp({
            credential: cert({ projectId, clientEmail, privateKey })
        })
        _adminValidated = true
        console.log('[Firebase Admin] ✓ Initialized with sanitized credentials.')
        return app
    } catch (e: any) {
        if (e.code === 'app/duplicate-app') {
            _adminValidated = true
            return getApp()
        }
        console.error('[Firebase Admin] Initialization failed:', e)
        throw e
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

    const isIlytatHq = decoded.tenantId === 'ilytat-hq' || decoded.organizationId === 'ilytat-hq'

    const isAdmin = (hasAdminRole && isIlytatHq)
        || decoded.email === 'zettler.jj@ilytat.com'
        || decoded.email === 'admin@ilytat.com'
        || decoded.uid === 'BoHGcwh2ApNQiJJIgjZWBC9hY8I3'

    if (!isAdmin) {
        throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
    }

    return {
        ...decoded,
        isSuper: (decoded.role === 'super' || decoded.roles?.includes('super')) && isIlytatHq
    }
}
