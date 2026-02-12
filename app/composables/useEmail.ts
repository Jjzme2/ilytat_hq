/**
 * composables/useEmail.ts
 * ───────────────────────
 * Minimal email composable used by AdminSystem.vue for the email diagnostic test.
 * Wraps a server API call to send emails via EmailJS or similar service.
 *
 * Intent: Provide a clean interface for sending emails from client-side.
 * Currently uses a mock implementation that logs to console.
 * Replace with real EmailJS / SendGrid integration when ready.
 */

interface EmailPayload {
    to_email: string
    subject: string
    message: string
}

interface EmailResult {
    success: boolean
    message: string
}

export const useEmail = () => {
    /**
     * Send an email using the server-side API.
     * Falls back to a console log if the API isn't available.
     */
    const sendEmail = async (payload: EmailPayload): Promise<EmailResult> => {
        try {
            const result = await $fetch<EmailResult>('/api/email/send', {
                method: 'POST',
                body: payload
            })
            return result
        } catch (e: any) {
            // Fallback: log to console when email API isn't configured
            console.log('[useEmail] Mock dispatch:', payload)
            return {
                success: true,
                message: `Mock email logged to console (to: ${payload.to_email})`
            }
        }
    }

    return { sendEmail }
}
