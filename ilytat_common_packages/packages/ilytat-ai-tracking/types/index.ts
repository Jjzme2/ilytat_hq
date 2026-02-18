export interface AIModel {
    id: string;
    name: string;
    provider: 'gemini' | 'openai' | 'anthropic';
    tier: 'flagship' | 'fast' | 'economy';
    isFlash?: boolean; // Deprecated in favor of tier, kept for compat
    costPer1kInput: number;
    costPer1kOutput: number;
    limits: {
        maxTokens: number;
        description: string; // e.g., "Best for complex reasoning"
    };
}

export interface AIRequest {
    prompt: string;
    systemMessage?: string;
    modelId?: string; // Optional, server defaults to Waterfall (Flash -> Pro)
    temperature?: number;

    // Context for tracking
    feature: string; // e.g., 'finance-analysis', 'document-draft'
    tenantId?: string;
}

export interface AIResponse {
    content: string;
    modelUsed: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface UsageLog {
    id?: string;
    timestamp: Date;
    userId: string;
    tenantId: string;
    feature: string;
    modelId: string;
    tokensIn: number;
    tokensOut: number;
    cost: number;
    status: 'success' | 'failure';
    error?: string;
}
