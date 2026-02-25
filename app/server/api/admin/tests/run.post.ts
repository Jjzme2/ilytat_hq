import { Logger } from '~/utils/Logger';
/**
 * server/api/admin/tests/run.post.ts
 * ─────────────────────────────
 * Run the full Vitest suite from the admin panel.
 * 
 * Intent: Allows admins to execute automated tests and view results in the UI.
 * Security: Restricted to admin users in DEVELOPMENT ONLY.
 */

import { defineEventHandler, createError } from 'h3'
import { exec } from 'child_process'
import { promisify } from 'util'
import { verifyAdminAccess } from '../../../utils/adminAuth'

const execAsync = promisify(exec)

export default defineEventHandler(async (event) => {
    // 1. Verify Admin Access
    try {
        await verifyAdminAccess(event)
    } catch {
        // Allow fallback in pure local dev, but strictly deny in prod
        if (!import.meta.dev) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Unauthorized access to test runner.'
            })
        }
    }

    // 2. Prevent Production Execution
    if (!import.meta.dev && process.env.NODE_ENV === 'production') {
        throw createError({
            statusCode: 403,
            statusMessage: 'Test execution is strictly disabled in production environments.'
        })
    }

    // 3. Execute Vitest
    try {
        // Use npx to ensure we hit the local vitest binary. Use the json reporter.
        const { stdout } = await execAsync('npx vitest run --reporter=json')

        try {
            const parsedResult = JSON.parse(stdout)
            return {
                success: true,
                results: parsedResult
            }
        } catch (parseError) {
            Logger.error('[Admin Tests] Failed to parse vitest JSON output:', parseError)
            return { success: true, rawOutput: stdout, error: 'Unparseable JSON from Vitest' }
        }

    } catch (error: any) {
        // Vitest exits with code 1 if tests fail, causing execAsync to throw.
        // We still want to parse and return the JSON output.
        if (error.stdout) {
            try {
                const parsedResult = JSON.parse(error.stdout)
                return {
                    success: false,
                    results: parsedResult
                }
            } catch (parseError) {
                Logger.error('[Admin Tests] Failed to parse failing vitest JSON output:', parseError)
                return { success: false, message: error.message, rawStdout: error.stdout }
            }
        }

        Logger.error('[Admin Tests] Command execution failed entirely:', error.message)
        throw createError({
            statusCode: 500,
            statusMessage: `Test execution failed: ${error.message}`
        })
    }
})
