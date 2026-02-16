import { Task } from '~/models/Task';
import { where, orderBy, type QueryConstraint } from 'firebase/firestore';
import { AppError } from '~/utils/AppError';
import { Logger } from '~/utils/Logger';

export const useTasks = () => {
    const { tenantId } = useTenant();

    const {
        getAll,
        create,
        update,
        remove
    } = useFirestoreRepository<Task>(
        'tasks',
        (data) => new Task(data)
    );

    const tasks = ref<Task[]>([]);
    const isLoading = ref(false);
    const error = ref<AppError | null>(null);

    const handleError = (e: any, context: string) => {
        if (e instanceof AppError) {
            error.value = e;
        } else {
            error.value = new AppError(e.message || 'An unexpected error occurred', 'UNKNOWN_ERROR', 500, { originalError: e });
        }
        Logger.error(`[useTasks] ${context} violation:`, error.value);
    };

    const fetchTasks = async (projectId: string, constraints: QueryConstraint[] = []) => {
        isLoading.value = true;
        error.value = null;
        try {
            if (!tenantId.value) return;

            const finalConstraints = [
                where('tenantId', '==', tenantId.value),
                where('projectId', '==', projectId),
                orderBy('createdAt', 'desc'),
                ...constraints
            ];

            tasks.value = await getAll(finalConstraints);
            return tasks.value;
        } catch (e: any) {
            handleError(e, 'fetchTasks');
        } finally {
            isLoading.value = false;
        }
    };

    const fetchTasksByGoal = async (projectId: string, goalId: string) => {
        return fetchTasks(projectId, [where('goalId', '==', goalId)]);
    };

    const createTask = async (projectId: string, data: Partial<Task> & { title: string }) => {
        isLoading.value = true;
        error.value = null;
        try {
            if (!tenantId.value) throw new AppError("No tenant context", "NO_TENANT", 400);

            // Prepare data for Task constructor
            // We need to ensure we pass a plain object that Task constructor accepts
            // Task constructor validates via Zod.
            // We merge defaults here or let Logic handle it.
            // TaskSchema requires projectId and tenantId.
            const taskInput = {
                ...data,
                projectId,
                tenantId: tenantId.value,
                // Ensure other fields are present if needed, but defaults in Schema handle most
            };

            // Instantiate to validate and sanitize
            const newTask = new Task(taskInput);

            // Allow repository to handle Firestore creation
            const created = await create(newTask);

            // Add to local state
            tasks.value.unshift(created);
            return created;
        } catch (e: any) {
            handleError(e, 'createTask');
            throw error.value;
        } finally {
            isLoading.value = false;
        }
    };

    const updateTask = async (projectId: string, taskId: string, updates: Partial<Task>) => {
        isLoading.value = true;
        error.value = null;
        try {
            await update(taskId, updates);

            // Update local state
            const index = tasks.value.findIndex(t => t.id === taskId);
            if (index !== -1 && tasks.value[index]) {
                const existingData = tasks.value[index].toJSON();
                tasks.value[index] = new Task({ ...existingData, ...updates });
            }
        } catch (e: any) {
            handleError(e, 'updateTask');
            throw error.value;
        } finally {
            isLoading.value = false;
        }
    };

    const deleteTask = async (projectId: string, taskId: string) => {
        isLoading.value = true;
        error.value = null;
        try {
            await remove(taskId);
            tasks.value = tasks.value.filter(t => t.id !== taskId);
        } catch (e: any) {
            handleError(e, 'deleteTask');
            throw error.value;
        } finally {
            isLoading.value = false;
        }
    };

    return {
        tasks,
        isLoading,
        error,
        fetchTasks,
        fetchTasksByGoal,
        createTask,
        updateTask,
        deleteTask
    };
};

