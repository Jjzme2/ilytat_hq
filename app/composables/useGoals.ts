import { Goal } from '~/models/Goal';
import { AppError } from '~/utils/AppError';
import { Logger } from '~/utils/Logger';
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

    const fetchGoals = async (projectId?: string, constraints: QueryConstraint[] = []) => {
        isLoading.value = true;
        error.value = null;
        try {
            if (!tenantId.value) return;

            const baseConstraints = [
                where('tenantId', '==', tenantId.value),
                orderBy('createdAt', 'desc')
            ];

            if (projectId) {
                baseConstraints.push(where('projectId', '==', projectId));
            }

            const q = query(
                collection(db, 'goals'),
                ...baseConstraints,
                ...constraints
            );
            const snapshot = await getDocs(q);
            goals.value = snapshot.docs.map(d => new Goal({ ...d.data(), id: d.id }));
            return goals.value;
        } catch (e: any) {
            Logger.error('Failed to fetch goals', e);
            error.value = e.message;
            throw new AppError(e.message, 'GOAL_FETCH_ERROR', e);
        } finally {
            isLoading.value = false;
        }
    };

    const createGoal = async (projectId: string, data: Partial<Goal> & { title: string }) => {
        isLoading.value = true;
        error.value = null;
        try {
            if (!tenantId.value) throw new Error("No tenant context");

            // Prepare strict data for validation
            const rawData = {
                ...data,
                tenantId: tenantId.value,
                projectId: projectId,
                // Default these for validation, they get overwritten by serverTimestamp in DB
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Validate via Model
            const goalModel = new Goal(rawData);
            const goalData = goalModel.toJSON();

            // Remove ID if present (shouldn't be for new doc) and set server timestamps
            delete (goalData as any).id;
            (goalData as any).createdAt = serverTimestamp();
            (goalData as any).updatedAt = serverTimestamp();

            const docRef = await addDoc(collection(db, 'goals'), goalData);

            // Return valid Model instance
            const created = new Goal({ ...goalData, id: docRef.id, createdAt: new Date(), updatedAt: new Date() });
            goals.value.unshift(created);
            return created;
        } catch (e: any) {
            Logger.error('Failed to create goal', e);
            error.value = e.message;
            throw new AppError(e.message, 'GOAL_CREATE_ERROR', e);
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
                // Merge updates into existing model to maintain reactivity without full reload
                // Helper: Instantiate new model to validate updates if needed, though partial updates are trickier with strict schema
                // For now, trust the updates and standard casting
                const updatedData = { ...goals.value[index].toJSON(), ...updates, updatedAt: new Date() };
                goals.value[index] = new Goal(updatedData);
            }
        } catch (e: any) {
            Logger.error('Failed to update goal', e);
            error.value = e.message;
            throw new AppError(e.message, 'GOAL_UPDATE_ERROR', e);
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
            Logger.error('Failed to delete goal', e);
            error.value = e.message;
            throw new AppError(e.message, 'GOAL_DELETE_ERROR', e);
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
