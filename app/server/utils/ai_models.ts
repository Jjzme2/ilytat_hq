import type { AIModel } from '@ai-tracking/types';

export const AVAILABLE_MODELS: AIModel[] = [
    {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        provider: 'gemini',
        tier: 'flagship',
        isFlash: false,
        costPer1kInput: 0.0025, // Estimate
        costPer1kOutput: 0.0075, // Estimate
        limits: {
            maxTokens: 2000000,
            description: "Google's most capable AI. Best for complex reasoning, coding, and creative work."
        }
    },
    {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        provider: 'gemini',
        tier: 'fast',
        isFlash: true,
        costPer1kInput: 0.0001,
        costPer1kOutput: 0.0004,
        limits: {
            maxTokens: 1000000,
            description: "Lightweight and fast. Ideal for high-volume tasks and quick responses."
        }
    }
];
