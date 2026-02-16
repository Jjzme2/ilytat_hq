import { computed, type Ref } from 'vue';
import { doc } from 'firebase/firestore';
import { useFirestore, useDocument } from 'vuefire';
// import { quicklaunch as globalQuickLaunch } from '~/config/quicklaunch';
import { useTenant } from './useTenant';

/**
 * useQuickLaunch Composable
 *
 * Aggregates QuickLaunch links from three levels:
 * 1. Global Defaults (config/quicklaunch.ts)
 * 2. Tenant Overrides (stored on Tenant model)
 * 3. Project Overrides (stored on Project model)
 *
 * Each level can override or add to the previous one.
 */
export const useQuickLaunch = (projectId?: string | null | Ref<string | undefined>) => {
    const db = useFirestore();
    const { tenant } = useTenant();

    // Fetch project document if projectId is provided
    const projectDocRef = computed(() => {
        const id = typeof projectId === 'string' ? projectId : projectId?.value;
        // Ensure we have a projectId before creating ref
        // Project path is now flattened: projects/{projectId}
        if (id) {
            return doc(db, 'projects', id);
        }
        return null;
    });
    const { data: project } = useDocument(projectDocRef);

    const links = computed(() => {
        // Fallback to empty if global config is missing/commented out
        let aggregatedLinks = {};
        // If imported, use it:
        // let aggregatedLinks = { ...globalQuickLaunch };

        // 1. Tenant Overrides
        if (tenant.value?.quickLaunch) {
            aggregatedLinks = { ...aggregatedLinks, ...tenant.value.quickLaunch };
        }

        // 2. Project Overrides
        if (project.value?.quickLaunch) {
            aggregatedLinks = { ...aggregatedLinks, ...project.value.quickLaunch };
        }

        return aggregatedLinks;
    });

    return {
        links
    };
};
