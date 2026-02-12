import { Task } from '~/models/Task';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp,
    type QueryConstraint
} from 'firebase/firestore';

export const useTasks = () => {
    const { db } = useFirebase();
    const { tenantId } = useTenant();

    const tasks = ref<Task[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const fetchTasks = async (projectId: string, constraints: QueryConstraint[] = []) => {
        isLoading.value = true;
        error.value = null;
        try {
            if (!tenantId.value) return;

            const q = query(
                collection(db, 'tasks'),
                where('tenantId', '==', tenantId.value),
                where('projectId', '==', projectId),
                orderBy('createdAt', 'desc'),
                ...constraints
            );
            const snapshot = await getDocs(q);
            tasks.value = snapshot.docs.map(d => new Task({ ...d.data(), id: d.id }));
            return tasks.value;
        } catch (e: any) {
            error.value = e.message;
            throw e;
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
            if (!tenantId.value) throw new Error("No tenant context");

            const taskData = new Task(data).toJSON();
            delete (taskData as any).id;
            taskData.tenantId = tenantId.value;
            taskData.projectId = projectId;
            taskData.createdAt = serverTimestamp() as any;
            taskData.updatedAt = serverTimestamp() as any;

            const docRef = await addDoc(collection(db, 'tasks'), taskData);
            const created = new Task({ ...taskData, id: docRef.id });
            tasks.value.unshift(created);
            return created;
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    const updateTask = async (projectId: string, taskId: string, updates: Partial<Task>) => {
        isLoading.value = true;
        error.value = null;
        try {
            await updateDoc(doc(db, 'tasks', taskId), {
                ...updates,
                updatedAt: serverTimestamp()
            });

            const index = tasks.value.findIndex(t => t.id === taskId);
            if (index !== -1 && tasks.value[index]) {
                tasks.value[index] = new Task({ ...tasks.value[index].toJSON(), ...updates });
            }
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    const deleteTask = async (projectId: string, taskId: string) => {
        isLoading.value = true;
        error.value = null;
        try {
            await deleteDoc(doc(db, 'tasks', taskId));
            tasks.value = tasks.value.filter(t => t.id !== taskId);
        } catch (e: any) {
            error.value = e.message;
            throw e;
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
