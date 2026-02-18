import { firestore } from './firebase';
import { AVAILABLE_MODELS } from './ai_models';

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

        await firestore.collection('ai_usage').add({
            timestamp: new Date(),
            userId: data.userId,
            tenantId: data.tenantId || 'personal',
            feature: data.feature,
            modelId: data.modelId,
            tokensIn: data.tokensIn,
            tokensOut: data.tokensOut,
            cost: cost,
            status: 'success',
            // Store truncated response for review (max 2000 chars for Firestore efficiency)
            responseContent: data.content.length > 2000
                ? data.content.substring(0, 2000) + '...'
                : data.content
        });
    } catch (e) {
        console.error('Failed to log AI usage', e);
    }
};
