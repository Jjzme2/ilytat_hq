import { Goal } from '~/models/Goal';
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

export const useGoals = () => {
    const { db } = useFirebase();
    const { tenantId } = useTenant();

    const goals = ref<Goal[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const fetchGoals = async (projectId: string, constraints: QueryConstraint[] = []) => {
        isLoading.value = true;
        error.value = null;
        try {
            if (!tenantId.value) return;

            const q = query(
                collection(db, 'goals'),
                where('tenantId', '==', tenantId.value),
                where('projectId', '==', projectId),
                orderBy('createdAt', 'desc'),
                ...constraints
            );
            const snapshot = await getDocs(q);
            goals.value = snapshot.docs.map(d => new Goal({ ...d.data(), id: d.id }));
            return goals.value;
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    const createGoal = async (projectId: string, data: Partial<Goal> & { title: string }) => {
        isLoading.value = true;
        error.value = null;
        try {
            if (!tenantId.value) throw new Error("No tenant context");

            const goalData = new Goal(data).toJSON();
            delete (goalData as any).id;
            goalData.tenantId = tenantId.value;
            goalData.projectId = projectId;
            goalData.createdAt = serverTimestamp() as any;
            goalData.updatedAt = serverTimestamp() as any;

            const docRef = await addDoc(collection(db, 'goals'), goalData);
            const created = new Goal({ ...goalData, id: docRef.id });
            goals.value.unshift(created);
            return created;
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    const updateGoal = async (projectId: string, goalId: string, updates: Partial<Goal>) => {
        isLoading.value = true;
        error.value = null;
        try {
            await updateDoc(doc(db, 'goals', goalId), {
                ...updates,
                updatedAt: serverTimestamp()
            });

            const index = goals.value.findIndex(g => g.id === goalId);
            if (index !== -1 && goals.value[index]) {
                goals.value[index] = new Goal({ ...goals.value[index].toJSON(), ...updates });
            }
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    const deleteGoal = async (projectId: string, goalId: string) => {
        isLoading.value = true;
        error.value = null;
        try {
            await deleteDoc(doc(db, 'goals', goalId));
            goals.value = goals.value.filter(g => g.id !== goalId);
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    return {
        goals,
        isLoading,
        error,
        fetchGoals,
        createGoal,
        updateGoal,
        deleteGoal
    };
};
