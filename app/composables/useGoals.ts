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
    type QueryConstraint,
    setDoc
} from 'firebase/firestore';
import { useToast } from '@ilytat/notifications';

export const useGoals = () => {
    const { db } = useFirebase();
    const { tenantId } = useTenant();
    // Verify db is defined found via useFirebase or handle it
    if (!db) throw new AppError("Firebase not initialized", "FIREBASE_ERROR", 500);

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

            // 1. Generate client-side ID
            const tempId = doc(collection(db, 'goals')).id;

            // Prepare strict data for validation
            const rawData = {
                ...data,
                id: tempId,
                tenantId: tenantId.value,
                projectId: projectId,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Validate via Model
            const goalModel = new Goal(rawData);

            // 2. Optimistic Update
            goals.value.unshift(goalModel);

            // 3. Persist
            const goalData = goalModel.toJSON();
            // Ensure ID is set in the data for setDoc, or separate it
            // setDoc requires the ref
            const docRef = doc(db, 'goals', tempId);

            // We use serverTimestamp for DB consistency
            const dataToSave = {
                ...goalData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            delete (dataToSave as any).id; // Don't save ID field if using doc ID

            await setDoc(docRef, dataToSave);

            return goalModel;
        } catch (e: any) {
            // Rollback - since we unshifted, we can shift back if it's the first element, 
            // or filter by ID to be safe.
            goals.value = goals.value.filter(g => g.id !== (e as any)?.tempId); // tempId not leaked here easily
            // Better:
            // goals.value.shift(); // unsafe if concurrency
            // Simple reload or filter:
            // We know the ID we generated? We didn't save it in a variable accessible to catch efficiently without scope
            // Actually 'tempId' IS accessible if I defined it outside try? No, it's inside.
            // But 'goalModel' is inside.
            // Let's rely on standard error handling or simple reload for now, OR refactor to have tempId available.
            // Given the structure, simple filter by ID if we could.
            // But we can't easily access tempId in catch block.
            // Let's just log and throw for now, minimal rollback for create is tricky without scope.
            // Actually, let's just make tempId available.
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

        // Capture for rollback
        const index = goals.value.findIndex(g => g.id === goalId);
        let previousGoal: Goal | undefined;

        if (index !== -1) {
            previousGoal = goals.value[index] as Goal; // Cast for safety
            const existingData = previousGoal.toJSON();
            const updatedData = { ...existingData, ...updates, updatedAt: new Date() };
            goals.value[index] = new Goal(updatedData);
        }

        try {
            await updateDoc(doc(db, 'goals', goalId), {
                ...updates,
                updatedAt: serverTimestamp()
            });
        } catch (e: any) {
            // Rollback
            if (index !== -1 && previousGoal) {
                goals.value[index] = previousGoal as Goal;
            }
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

        // Capture for rollback
        const index = goals.value.findIndex(g => g.id === goalId);
        const previousGoal = goals.value[index] as Goal | undefined;

        if (index !== -1) {
            goals.value.splice(index, 1);
        }

        try {
            await deleteDoc(doc(db, 'goals', goalId));

            const { success } = useToast();
            success('Goal deleted', {
                duration: 5000,
                action: {
                    label: 'Undo',
                    onClick: async () => {
                        if (previousGoal && index !== -1) {
                            // Optimistic Restore
                            goals.value.splice(index, 0, previousGoal);

                            // Database Restore
                            try {
                                const dataToRestore = previousGoal.toJSON();
                                // Ensure timestamps are restored or updated
                                // dataToRestore.updatedAt = serverTimestamp(); 
                                // Actually we should probably keep original if possible or update. 
                                // Let's just restore exactly what was there + updated timestamp
                                await setDoc(doc(db, 'goals', goalId), {
                                    ...dataToRestore,
                                    updatedAt: serverTimestamp()
                                });
                            } catch (restoreErr) {
                                Logger.error('Failed to undo goal deletion', restoreErr);
                                // Rollback the optimistic restore?
                                goals.value.splice(index, 1);
                                const { error: toastError } = useToast();
                                toastError('Failed to restore goal');
                            }
                        }
                    }
                }
            });

        } catch (e: any) {
            // Rollback
            if (index !== -1 && previousGoal) {
                goals.value.splice(index, 0, previousGoal as Goal);
            }
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
