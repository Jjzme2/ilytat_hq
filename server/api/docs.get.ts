/**
 * GET /api/docs
 *
 * Lists objects in the Cloudflare R2 'docs' bucket,
 * or returns a single object's content when ?key= is provided.
 *
 * R2 credentials come from server-only runtimeConfig.
 */
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { verifyAdminToken } from '../utils/adminAuth';

// Lazy-initialised client (created once per cold start)
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
    // SECURITY: Ensure user is authenticated
    await verifyAdminToken(event);

    const query = getQuery(event);
    const config = useRuntimeConfig();
    const bucket = config.cloudflareR2BucketName as string;
    const client = getClient();

    // If a key is provided, return that specific object
    // TODO: Ideally we should use Presigned URLs here and enforce auth for all operations.
    // For now, we allow unauthenticated access to specific keys to support <img> tags in the frontend.
    if (query.key && typeof query.key === 'string') {
        try {
            const command = new GetObjectCommand({ Bucket: bucket, Key: query.key });
            const response = await client.send(command);

            // Stream the body back to the client
            if (response.Body) {
                setResponseHeader(event, 'Content-Type', response.ContentType || 'application/octet-stream');
                if (response.ContentLength) {
                    setResponseHeader(event, 'Content-Length', String(response.ContentLength));
                }
                return sendStream(event, response.Body as any);
            }

            throw createError({ statusCode: 404, statusMessage: 'Object body is empty' });
        } catch (err: any) {
            if (err.name === 'NoSuchKey') {
                throw createError({ statusCode: 404, statusMessage: `Key not found: ${query.key}` });
            }
            throw createError({ statusCode: 500, statusMessage: err.message });
        }
    }

    // Default: list all objects in the bucket
    // Require authentication for listing files
    await verifyAdminToken(event);

    try {
        const prefix = typeof query.prefix === 'string' ? query.prefix : undefined;
        const command = new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix });
        const response = await client.send(command);

        const files = (response.Contents || []).map((obj) => ({
            key: obj.Key,
            size: obj.Size,
            lastModified: obj.LastModified?.toISOString(),
        }));

        return { files, count: files.length };
    } catch (err: any) {
        throw createError({ statusCode: 500, statusMessage: err.message });
    }
});
