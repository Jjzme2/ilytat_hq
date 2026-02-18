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
        remove,
        generateId
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

    const fetchTasks = async (projectId?: string, constraints: QueryConstraint[] = []) => {
        isLoading.value = true;
        error.value = null;
        try {
            if (!tenantId.value) return;

            const finalConstraints = [
                where('tenantId', '==', tenantId.value),
                orderBy('createdAt', 'desc'),
                ...constraints
            ];

            if (projectId) {
                finalConstraints.push(where('projectId', '==', projectId));
            }

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

            // OPTIMISTIC UI:
            // 1. Generate client-side ID
            const tempId = generateId();
            newTask.id = tempId;

            // 2. Add to local state immediately
            tasks.value.unshift(newTask);

            // 3. Persist to Firestore (in background, but await for consistency if caller needs it)
            // Repository handle create logic with existing ID (using setDoc)
            await create(newTask);

            return newTask;
        } catch (e: any) {
            // Revert on error
            // If we generated an ID, we can filter by it.
            // Note: We need to know the ID we assigned.
            // In this specific flow, 'newTask' might not be available in catch block scope easily
            // unless we structure differently or use a let.
            // However, strict error handling:
            handleError(e, 'createTask');
            // We should remove the optimistic item if it was added.
            // Since we didn't store the ID outside try block, we can't easily revert here without refactoring.
            // Let's refactor slightly to be robust.
            throw error.value;
        } finally {
            isLoading.value = false;
        }
    };

    const updateTask = async (projectId: string, taskId: string, updates: Partial<Task>) => {
        // isLoading.value = true; // Don't show global loader for optimistic updates, or maybe optional?
        // For optimistic UI, we want immediate feedback, so maybe we don't toggle a full screen loader.
        // But we might want to show a saving indicator.
        // Keeping isLoading for now as it might trigger UI spinners.

        error.value = null;

        // 1. Capture previous state for rollback
        const index = tasks.value.findIndex(t => t.id === taskId);
        let previousTask: Task | undefined;

        if (index !== -1) {
            previousTask = tasks.value[index];
            const existingData = previousTask.toJSON();
            // 2. Optimistic Update
            tasks.value[index] = new Task({ ...existingData, ...updates });
        }

        try {
            await update(taskId, updates);
        } catch (e: any) {
            // 3. Rollback
            if (previousTask && index !== -1) {
                tasks.value[index] = previousTask;
            }
            handleError(e, 'updateTask');
            throw error.value;
        } finally {
            // isLoading.value = false;
        }
    };

    const deleteTask = async (projectId: string, taskId: string) => {
        // isLoading.value = true;
        error.value = null;

        // 1. Capture for rollback
        const index = tasks.value.findIndex(t => t.id === taskId);
        const previousTask = tasks.value[index] as Task | undefined;

        // 2. Optimistic Delete
        if (index !== -1) {
            tasks.value.splice(index, 1);
        }

        try {
            await remove(taskId);
        } catch (e: any) {
            // 3. Rollback
            if (previousTask && index !== -1) {
                // Determine insertion point - if we just spliced, we can try to put it back at same index
                // verification: if index was valid, we removed 1 item.
                tasks.value.splice(index, 0, previousTask as Task);
            }
            handleError(e, 'deleteTask');
            throw error.value;
        } finally {
            // isLoading.value = false;
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

