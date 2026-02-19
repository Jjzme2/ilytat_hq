import { firestore } from './firebase';
import { AVAILABLE_MODELS } from './ai_models';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const config = useRuntimeConfig();

// Initialize R2 Client
const r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${config.cloudflareR2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: config.cloudflareR2AccessKeyId,
        secretAccessKey: config.cloudflareR2SecretAccessKey,
    },
});

export const calculateCost = (modelId: string, inputTokens: number, outputTokens: number) => {
    const model = AVAILABLE_MODELS.find(m => m.id === modelId);
    if (!model) return 0;
    return (inputTokens / 1000 * model.costPer1kInput) + (outputTokens / 1000 * model.costPer1kOutput);
};

export const logUsage = async (event: any, data: {
    userId: string;
    tenantId?: string;
    feature: string;
    modelId: string;
    tokensIn: number;
    tokensOut: number;
    content: string;
}) => {
    try {
        const cost = calculateCost(data.modelId, data.tokensIn, data.tokensOut);
        const timestamp = new Date();
        const logId = `${timestamp.toISOString()}-${data.userId}-${data.modelId}`;
        const logKey = `ai-logs/${data.tenantId || 'personal'}/${logId}.json`;

        let storageUrl = null;

        // Upload full content to R2
        try {
            await r2.send(new PutObjectCommand({
                Bucket: 'ai-usage',
                Key: logKey,
                Body: JSON.stringify({
                    ...data,
                    timestamp,
                    cost
                }),
                ContentType: 'application/json',
            }));
            storageUrl = logKey;
        } catch (r2Error) {
            console.error('Failed to upload AI log to R2:', r2Error);
            // Non-blocking, we still want the metrics in Firestore
        }

        await firestore.collection('ai_usage').add({
            timestamp,
            userId: data.userId,
            tenantId: data.tenantId || 'personal',
            feature: data.feature,
            modelId: data.modelId,
            tokensIn: data.tokensIn,
            tokensOut: data.tokensOut,
            cost: cost,
            status: 'success',
            // Store reference to full log
            logKey: storageUrl,
            // Keep truncated for quick preview if R2 fails or for ease of access
            responseContent: data.content.length > 500
                ? data.content.substring(0, 500) + '... (See R2 Log)'
                : data.content
        });
    } catch (e) {
        console.error('Failed to log AI usage', e);
    }
};
