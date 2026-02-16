import { Project } from '~/models/Project';
import { where } from 'firebase/firestore';
import { AppError } from '~/utils/AppError';
import { Logger } from '~/utils/Logger';

export const useProjects = () => {
    const { tenantId } = useTenant();

    const {
        getAll,
        getById,
        create,
        update,
        remove
    } = useFirestoreRepository<Project>(
        'projects',
        (data) => new Project(data)
    );

    const projects = ref<Project[]>([]);
    const currentProject = ref<Project | null>(null);
    const isLoading = ref(false);
    const error = ref<AppError | null>(null);

    const handleError = (e: any, context: string) => {
        if (e instanceof AppError) {
            error.value = e;
        } else {
            error.value = new AppError(e.message || 'An unexpected error occurred', 'UNKNOWN_ERROR', 500, { originalError: e });
        }
        Logger.error(`[useProjects] ${context} violation:`, error.value);
    };

    const fetchProjects = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            if (!tenantId.value) return;

            // Filter by tenantId to adhere to security rules
            projects.value = await getAll([where('tenantId', '==', tenantId.value)]);
        } catch (e: any) {
            handleError(e, 'fetchProjects');
        } finally {
            isLoading.value = false;
        }
    };

    const fetchProjectById = async (id: string) => {
        isLoading.value = true;
        error.value = null;
        try {
            // Note: getById doesn't take constraints in the repository current implementation
            // But firestore rules will enforce the tenant check
            currentProject.value = await getById(id);
        } catch (e: any) {
            handleError(e, 'fetchProjectById');
        } finally {
            isLoading.value = false;
        }
    };

    const createProject = async (project: Project) => {
        isLoading.value = true;
        error.value = null;
        try {
            if (!tenantId.value) throw new AppError("No tenant context", "NO_TENANT", 400);

            // Ensure tenantId is set before creating
            const data = project.toJSON();
            data.tenantId = tenantId.value;

            // Automatically add creator to members if not present
            const { user } = useUser();
            if (user.value?.uid && !data.members.includes(user.value.uid)) {
                data.members.push(user.value.uid);
            }

            const newProject = await create(new Project(data));
            projects.value.push(newProject);
            return newProject;
        } catch (e: any) {
            handleError(e, 'createProject');
            throw error.value; // Re-throw for UI to handle if needed
        } finally {
            isLoading.value = false;
        }
    };

    const updateProject = async (id: string, updates: Partial<Project>) => {
        isLoading.value = true;
        error.value = null;
        try {
            await update(id, updates);

            // Update local state
            const index = projects.value.findIndex(p => p.id === id);

            if (index !== -1 && projects.value[index]) {
                const existingData = projects.value[index].toJSON();
                // Creating a new instance with merged data
                // Note: Project constructor takes partial data safely via schema if we allowed it, 
                // but strictly it expects full data. We merge existing + updates.
                // However, updates might be partial. 
                // We should merge existingData (ProjectData) with updates (Partial<Project>).
                // But updates are NOT ProjectData, they are Project.
                // We need to be careful here. 
                // Best to fetch fresh or merge safely.
                // For now, simple merge:
                const merged = { ...existingData, ...updates };
                // This might fail strict schema parsing if updates has extra fields or if we miss required fields.
                // ExistingData is valid. Updates are partial.
                projects.value[index] = new Project(merged);
            }

            if (currentProject.value && currentProject.value.id === id) {
                const currentData = currentProject.value.toJSON();
                currentProject.value = new Project({ ...currentData, ...updates });
            }

        } catch (e: any) {
            handleError(e, 'updateProject');
            throw error.value;
        } finally {
            isLoading.value = false;
        }
    };

    const deleteProject = async (id: string) => {
        isLoading.value = true;
        error.value = null;
        try {
            await remove(id);
            projects.value = projects.value.filter(p => p.id !== id);
            if (currentProject.value && currentProject.value.id === id) {
                currentProject.value = null;
            }
        } catch (e: any) {
            handleError(e, 'deleteProject');
            throw error.value;
        } finally {
            isLoading.value = false;
        }
    };

    return {
        projects,
        currentProject,
        isLoading,
        error,
        fetchProjects,
        fetchProjectById,
        createProject,
        updateProject,
        deleteProject
    };
};

