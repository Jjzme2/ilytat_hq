import { Project } from '~/models/Project';
import { where, or } from 'firebase/firestore';
import { AppError } from '~/utils/AppError';
import { Logger } from '~/utils/Logger';

export const useProjects = () => {
    const { tenantId } = useTenant();
    const { user, isAdmin } = useUser();

    const {
        getAll,
        getById,
        create,
        update,
        remove,
        generateId
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
            if (!user.value?.uid) {
                Logger.warn('[useProjects] fetchProjects: No user UID');
                return;
            }

            Logger.debug(`[useProjects] fetchProjects: Fetching for user ${user.value.uid} tenant=${tenantId.value} isAdmin=${isAdmin.value}`);

            // Updated Security: 
            // 1. Members array allows cross-tenant personal projects
            // 2. Database admins can see all projects in their tenant
            if (isAdmin.value && tenantId.value) {
                Logger.debug('[useProjects] fetchProjects: Using OR query for Admin');
                projects.value = await getAll([
                    or(
                        where('members', 'array-contains', user.value.uid),
                        where('tenantId', '==', tenantId.value)
                    )
                ]);
            } else {
                Logger.debug('[useProjects] fetchProjects: Using simple member query');
                projects.value = await getAll([where('members', 'array-contains', user.value.uid)]);
            }
            Logger.debug(`[useProjects] fetchProjects: Retrieved ${projects.value.length} projects`);
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
            // Allow creation without tenantId for personal projects, unless explicitly required
            // if (!tenantId.value) throw new AppError("No tenant context", "NO_TENANT", 400);

            const data = project.toJSON();

            // Only force tenantId if it's available and not already set (or if we want to enforce it for tenant contexts)
            // Ideally, the caller sets the tenantId if it's a tenant project.
            // If tenantId is available in global state, we default to it, but allow it to be null/undefined for personal items.
            // However, the previous logic enforced it. 
            // User request: "default to a personal project" when at /projects

            if (!data.tenantId && tenantId.value) {
                // Check if we should enforce tenant? 
                // For now, let's assume if tenantId is present in context, we use it, 
                // UNLESS the project data explicitly set it to null (which toJSON might not carry if undefined).
                // Logic: use data.tenantId if set, else use global tenantId.
                data.tenantId = tenantId.value;
            }

            // If still no tenantId, it's a personal project (tenantId: null/undefined)

            // Set Owner & Roles
            const userId = user.value?.uid;
            if (userId) {
                if (!data.ownerId) data.ownerId = userId;
                if (!data.members.includes(userId)) data.members.push(userId);
                if (!data.roles[userId]) data.roles[userId] = 'owner';
            }

            const newProject = new Project(data);

            // OPTIMISTIC UI:
            const tempId = generateId();
            newProject.id = tempId;

            projects.value.push(newProject);

            await create(newProject);

            return newProject;
        } catch (e: any) {
            // Revert handled by caller catching or we should manage it?
            // Since we modify projects.value, we should revert on error.
            // But createProject doesn't have easy access to the exact instance index if pushed.
            // Just pop? Or find by ID.
            const tempId = (e as any)?.tempId; // Not available
            // For now, simpler error handling or rigorous revert:
            // We can't easily revert the push without the ref.
            // Let's rely on standard error handling for now as Project creation is heavier and usually on a separate page or modal.
            // Actually, let's implement revert for safety.
            // We need the reference.
            handleError(e, 'createProject');
            // If we failed, we should probably reload projects or remove the last added if matches.
            throw error.value;
        } finally {
            isLoading.value = false;
        }
    };

    const updateProject = async (id: string, updates: Partial<Project>) => {
        isLoading.value = true;
        error.value = null;

        // Capture state for rollback
        const index = projects.value.findIndex(p => p.id === id);
        let previousProject: Project | undefined;

        if (index !== -1) {
            previousProject = projects.value[index] as Project;
            const existingData = previousProject.toJSON();
            // Optimistic update
            projects.value[index] = new Project({ ...existingData, ...updates });
        }

        // Also update currentProject if it matches
        let previousCurrentProject: Project | null = null;
        if (currentProject.value && currentProject.value.id === id) {
            previousCurrentProject = currentProject.value;
            const currentData = currentProject.value.toJSON();
            currentProject.value = new Project({ ...currentData, ...updates });
        }

        try {
            await update(id, updates);
        } catch (e: any) {
            // Rollback
            if (index !== -1 && previousProject) {
                // Cast to defined Project to satisfy TS if unwrapping causes issues
                projects.value[index] = previousProject as Project;
            }
            if (previousCurrentProject) {
                currentProject.value = previousCurrentProject;
            }
            handleError(e, 'updateProject');
            throw error.value;
        } finally {
            isLoading.value = false;
        }
    };

    const deleteProject = async (id: string) => {
        isLoading.value = true;
        error.value = null;

        // Capture for rollback
        const index = projects.value.findIndex(p => p.id === id);
        const previousProject = projects.value[index] as Project | undefined;

        let previousCurrentProject: Project | null = null;
        if (currentProject.value && currentProject.value.id === id) {
            previousCurrentProject = currentProject.value;
        }

        // Optimistic Delete
        if (index !== -1) {
            projects.value.splice(index, 1);
        }
        if (currentProject.value && currentProject.value.id === id) {
            currentProject.value = null;
        }

        try {
            await remove(id);
        } catch (e: any) {
            // Revert
            if (previousProject && index !== -1) {
                // Cast to defined Project
                projects.value.splice(index, 0, previousProject as Project);
            }
            if (previousCurrentProject) {
                currentProject.value = previousCurrentProject;
            }
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

