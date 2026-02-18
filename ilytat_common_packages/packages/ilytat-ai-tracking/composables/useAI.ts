import { ref } from 'vue';
import { useStorage } from '@vueuse/core';
import type { AIRequest, AIResponse, AIModel } from '../types';

export const useAI = () => {
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Persist user preference, default to Flash for speed/cost if not set
    const selectedModelId = useStorage('ilytat-ai-preference', 'gemini-2.5-flash');

    const generate = async (request: AIRequest): Promise<AIResponse | null> => {
        isLoading.value = true;
        error.value = null;

        // Use selected model if not explicitly overridden by the specific feature request
        const modelId = request.modelId || selectedModelId.value;

        try {
            const { data, error: apiError } = await useFetch<AIResponse>('/api/ai/generate', {
                method: 'POST',
                body: { ...request, modelId }
            });

            if (apiError.value) {
                throw new Error(apiError.value.message || 'AI generation failed');
            }

            return data.value;
        } catch (e: any) {
            error.value = e.message;
            console.error('[useAI] Generation error:', e);
            return null;
        } finally {
            isLoading.value = false;
        }
    };

    const getModels = async (): Promise<AIModel[]> => {
        const { data, error: apiError } = await useFetch<AIModel[]>('/api/ai/models');
        if (apiError.value) {
            console.error('[useAI] Failed to fetch models:', apiError.value);
            return [];
        }
        return data.value || [];
    };

    return {
        isLoading,
        error,
        generate,
        getModels,
        selectedModelId
    };
};
