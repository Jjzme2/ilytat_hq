/**
 * POST /api/docs
 *
 * Uploads a file to the Cloudflare R2 'docs' bucket.
 * Accepts multipart form data with a 'file' field.
 * Optionally accepts a 'key' field to specify the storage key.
 * If no key is provided, the original filename is used.
 *
 * R2 credentials come from server-only runtimeConfig.
 */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { verifyAuthToken } from '../utils/adminAuth';

let s3: S3Client | null = null;

function getClient() {
    if (s3) return s3;

    const config = useRuntimeConfig();

    s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${config.cloudflareR2AccountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: config.cloudflareR2AccessKeyId as string,
            secretAccessKey: config.cloudflareR2SecretAccessKey as string,
        },
    });

    return s3;
}

export default defineEventHandler(async (event) => {
    // Ensure user is authenticated
    await verifyAuthToken(event);

    const config = useRuntimeConfig();
    const bucket = config.cloudflareR2BucketName as string;
    const client = getClient();

    try {
        const formData = await readMultipartFormData(event);
        if (!formData || formData.length === 0) {
            throw createError({ statusCode: 400, statusMessage: 'No file uploaded' });
        }

        const file = formData.find(f => f.name === 'file');
        if (!file || !file.data) {
            throw createError({ statusCode: 400, statusMessage: 'Missing "file" field' });
        }

        // Use the provided key or fallback to the original filename
        const keyField = formData.find(f => f.name === 'key');
        const key = keyField?.data?.toString() || file.filename || `upload-${Date.now()}`;

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: file.data,
            ContentType: file.type || 'application/octet-stream',
        });

        await client.send(command);

        return {
            success: true,
            key,
            size: file.data.length,
            contentType: file.type || 'application/octet-stream'
        };
    } catch (err: any) {
        if (err.statusCode) throw err; // Re-throw createError instances
        throw createError({ statusCode: 500, statusMessage: err.message });
    }
});
