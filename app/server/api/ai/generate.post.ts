import { GoogleGenerativeAI } from '@google/generative-ai';
import { logUsage } from '~/server/utils/ai_tracker';
import { AVAILABLE_MODELS } from '~/server/utils/ai_models';
import type { AIRequest, AIResponse } from '@ai-tracking/types';

const getGeminiClient = (apiKey: string) => new GoogleGenerativeAI(apiKey);

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Server configuration error: Missing AI API Key'
        });
    }

    const body = await readBody<AIRequest>(event);
    if (!body || !body.prompt) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing prompt'
        });
    }

    // Identify user for tracking
    // Assumes some auth middleware or session context populated 'user'
    // If using NuxtAuth or similar, access user from context. 
    // For now, we trust the body.userId if sent, or check auth context if available.
    // Ideally, we verify the user via auth token.
    // Let's assume the request sends userId/tenantId for now, but in prod verify token.
    // To be safe, we can check basic auth or session.
    // For now, we log what we get.

    const requestedModelId = body.modelId || 'gemini-2.5-flash';
    const client = getGeminiClient(apiKey);

    // Waterfall Logic
    // 1. Try requested model
    // 2. If fails (429/503), try Flash (if not already tried)

    let responseContent = '';
    let tokensIn = 0;
    let tokensOut = 0;
    let modelUsed = requestedModelId;

    try {
        const model = client.getGenerativeModel({ model: requestedModelId });

        let prompt = body.prompt;
        if (body.systemMessage) {
            // Gemini doesn't have "system" role in simple calls, usually prepended
            // Or use systemInstruction if supported by SDK version
            prompt = `System: ${body.systemMessage}\n\nUser: ${body.prompt}`;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        responseContent = response.text();

        // Usage metadata (Estimating if not provided by SDK directly in this version)
        // usageMetadata available in recent SDKS
        if (response.usageMetadata) {
            tokensIn = response.usageMetadata.promptTokenCount;
            tokensOut = response.usageMetadata.candidatesTokenCount;
        } else {
            // Fallback estimation
            tokensIn = prompt.length / 4;
            tokensOut = responseContent.length / 4;
        }

    } catch (e: any) {
        console.error(`Model ${requestedModelId} failed:`, e);

        // Fallback to Flash if we didn't use it
        if (requestedModelId !== 'gemini-2.5-flash') {
            try {
                console.log('Falling back to Gemini 3.0 Flash...');
                modelUsed = 'gemini-2.5-flash';
                const fallbackModel = client.getGenerativeModel({ model: modelUsed });
                let prompt = body.prompt;
                if (body.systemMessage) {
                    prompt = `System: ${body.systemMessage}\n\nUser: ${body.prompt}`;
                }
                const result = await fallbackModel.generateContent(prompt);
                const response = await result.response;
                responseContent = response.text();
                if (response.usageMetadata) {
                    tokensIn = response.usageMetadata.promptTokenCount;
                    tokensOut = response.usageMetadata.candidatesTokenCount;
                } else {
                    tokensIn = prompt.length / 4;
                    tokensOut = responseContent.length / 4;
                }
            } catch (fallbackError) {
                throw createError({
                    statusCode: 503,
                    statusMessage: 'AI Service Unavailable (Fallback failed)'
                });
            }
        } else {
            throw createError({
                statusCode: 503,
                statusMessage: 'AI Service Unavailable'
            });
        }
    }

    // Log Usage (Async, don't block response)
    logUsage(event, {
        userId: 'system', // TODO: Extract from auth context
        tenantId: body.tenantId || 'system',
        feature: body.feature || 'unknown',
        modelId: modelUsed,
        tokensIn,
        tokensOut,
        content: responseContent
    });

    return {
        content: responseContent,
        modelUsed,
        usage: {
            promptTokens: tokensIn,
            completionTokens: tokensOut,
            totalTokens: tokensIn + tokensOut
        }
    } as AIResponse;
});
