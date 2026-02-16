import { Project } from '~/models/Project';
import { where } from 'firebase/firestore';

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
    const error = ref<string | null>(null);

    const fetchProjects = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            if (!tenantId.value) return;

            // Filter by tenantId to adhere to security rules
            projects.value = await getAll([where('tenantId', '==', tenantId.value)]);
        } catch (e: any) {
            error.value = e.message;
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
            error.value = e.message;
        } finally {
            isLoading.value = false;
        }
    };

    const createProject = async (project: Project) => {
        isLoading.value = true;
        error.value = null;
        try {
            if (!tenantId.value) throw new Error("No tenant context");

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
            error.value = e.message;
            throw e;
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
                projects.value[index] = new Project({ ...existingData, ...updates });
            }

            if (currentProject.value && currentProject.value.id === id) {
                const currentData = currentProject.value.toJSON();
                currentProject.value = new Project({ ...currentData, ...updates });
            }

        } catch (e: any) {
            error.value = e.message;
            throw e;
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
            error.value = e.message;
            throw e;
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
