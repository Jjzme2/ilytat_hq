/**
 * DELETE /api/docs
 *
 * Deletes a file from the Cloudflare R2 'docs' bucket.
 * Requires a 'key' query parameter specifying the object to delete.
 *
 * R2 credentials come from server-only runtimeConfig.
 */
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { verifyAdminToken } from '../utils/adminAuth';

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
    // Require authentication
    await verifyAdminToken(event);

    const config = useRuntimeConfig();
    const bucket = config.cloudflareR2BucketName as string;
    const client = getClient();

    const query = getQuery(event);
    const key = query.key as string;

    if (!key) {
        throw createError({ statusCode: 400, statusMessage: 'Missing "key" query parameter' });
    }

    try {
        const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
        await client.send(command);

        return { success: true, deletedKey: key };
    } catch (err: any) {
        throw createError({ statusCode: 500, statusMessage: err.message });
    }
});
