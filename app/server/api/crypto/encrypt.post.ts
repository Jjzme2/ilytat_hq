/**
 * String Encryption Utility
 * Securely hashes text payloads using aes-256-cbc.
 * Used for redacting document variables where the platform natively needs decode access.
 */
import crypto from 'crypto';
import { Logger } from '~/utils/Logger';

const ALGORITHM = 'aes-256-cbc';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);
    const { text } = body;

    if (!text) {
        throw createError({ statusCode: 400, statusMessage: 'Text string is required for encryption' });
    }

    // Fallback to app id or gemini api key or any static ENV var to act as a symmetric key salt
    const secretHashBase = config.stripeWebhookSecret || config.geminiApiKey || 'IlytatHQDefaultLocalSecretBase123!';

    try {
        // Enforce 32 bytes for aes-256
        const key = crypto.createHash('sha256').update(String(secretHashBase)).digest('base64').substring(0, 32);
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Prepend the IV so the decryption utility can parse it out later if needed.
        const hashPayload = `${iv.toString('hex')}:${encrypted}`;

        return {
            hash: hashPayload
        };

    } catch (err) {
        Logger.error('[Crypto API] Failed to symmetrically encrypt payload', err);
        throw createError({ statusCode: 500, statusMessage: 'Failed to encrypt data symmetrically' });
    }
});
