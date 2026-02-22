import { ref } from 'vue';
import { UserInsight } from '~/models/UserInsight';
import { where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { useAI } from '@ai-tracking';
import { AI_PROMPTS } from '../config/prompts';
import { useTasks } from './useTasks';
import { useGoals } from './useGoals';
import { useProjects } from './useProjects';

export const useUserInsights = () => {
    const { user } = useUser();
    const { tenantId } = useTenant();
    const { generate, isLoading: isAIThinking } = useAI();

    // Actions
    const { fetchTasks } = useTasks();
    const { fetchGoals } = useGoals();
    const { fetchProjects } = useProjects();

    const {
        getAll,
        create,
        generateId
    } = useFirestoreRepository<UserInsight>(
        'user_insights',
        (data) => new UserInsight(data)
    );

    const currentInsight = ref<UserInsight | null>(null);
    const insightsHistory = ref<UserInsight[]>([]);
    const isLoading = ref(false);

    const fetchInsightsHistory = async () => {
        if (!user.value?.uid || !tenantId.value) return;
        isLoading.value = true;
        try {
            const results = await getAll([
                where('userId', '==', user.value.uid),
                where('tenantId', '==', tenantId.value),
                orderBy('createdAt', 'desc')
            ]);
            insightsHistory.value = results;
            return results;
        } catch (e) {
            console.error('[useUserInsights] fetchInsightsHistory error:', e);
        } finally {
            isLoading.value = false;
        }
    };

    const fetchLatestInsight = async () => {
        if (!user.value?.uid || !tenantId.value) return;
        isLoading.value = true;
        try {
            const results = await getAll([
                where('userId', '==', user.value.uid),
                where('tenantId', '==', tenantId.value),
                orderBy('createdAt', 'desc'),
                limit(1)
            ]);
            currentInsight.value = results[0] || null;

            // If we have results, also populate the history if it's empty
            if (results.length > 0 && insightsHistory.value.length === 0) {
                insightsHistory.value = results;
            }

            return currentInsight.value;
        } catch (e) {
            console.error('[useUserInsights] fetchLatestInsight error:', e);
        } finally {
            isLoading.value = false;
        }
    };

    const generateInsights = async () => {
        if (!user.value?.uid || !tenantId.value) return;
        isLoading.value = true;

        try {
            // 1. Gather Context
            const [tasks, goals, projects] = await Promise.all([
                fetchTasks() || Promise.resolve([]),
                fetchGoals() || Promise.resolve([]),
                fetchProjects() || Promise.resolve([])
            ]) as any[];

            const contextString = `
                Projects: ${(projects || []).map((p: any) => p.name).join(', ') || 'None'}
                Goals: ${(goals || []).map((g: any) => g.title).join(', ') || 'None'}
                Recent Tasks: ${(tasks || []).slice(0, 20).map((t: any) => t.title).join(', ') || 'None'}
            `;

            // 2. Call AI
            const response = await generate({
                prompt: contextString,
                systemMessage: AI_PROMPTS.assistant.profiling,
                feature: 'user_profiling'
            });

            if (response && response.content) {
                // 3. Create Insight Record
                const newInsight = new UserInsight({
                    userId: user.value.uid,
                    tenantId: tenantId.value,
                    summary: response.content,
                    focusAreas: [], // Could be extracted with more regex if needed
                    productivityScore: 85, // Placeholder or extracted
                    persona: 'Operator',
                    lastAnalyzed: serverTimestamp()
                });

                await create(newInsight);
                currentInsight.value = newInsight;

                // Prepend to history
                insightsHistory.value = [newInsight, ...insightsHistory.value];

                return newInsight;
            }
        } catch (e) {
            console.error('[useUserInsights] generateInsights error:', e);
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    return {
        currentInsight,
        insightsHistory,
        isLoading,
        isAIThinking,
        fetchLatestInsight,
        fetchInsightsHistory,
        generateInsights
    };
};
