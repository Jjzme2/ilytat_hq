import { ref, computed } from 'vue';
import { TimeLog } from '~/models/TimeLog';
import { useFirestoreRepository } from './useFirestoreRepository';
import { useTenant } from './useTenant';
import { useUser } from './useUser';
import { where, orderBy, limit, type QueryConstraint } from 'firebase/firestore';

export const useTimeTracking = () => {
    const { tenantId } = useTenant();
    const { user } = useUser();

    // Repository
    const {
        getAll,
        create,
        update,
        remove
    } = useFirestoreRepository<TimeLog>('time_logs', (data) => new TimeLog(data));

    // State
    const logs = ref<TimeLog[]>([]);
    const activeLog = ref<TimeLog | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Initial fetch for active timer
    const init = async () => {
        if (!user.value || !tenantId.value) return;

        // Find if there's an active timer (endTime is null)
        const activeConstraints = [
            where('tenantId', '==', tenantId.value),
            where('userId', '==', user.value.uid),
            where('endTime', '==', null),
            limit(1)
        ];

        const active = await getAll(activeConstraints);
        if (active.length > 0) {
            activeLog.value = active[0] as TimeLog; // Explicit cast if repository returns generic T | undefined where T is TimeLog
        }
    };

    const fetchLogs = async (goalId?: string) => {
        isLoading.value = true;
        try {
            if (!tenantId.value || !user.value) return;

            const constraints: QueryConstraint[] = [
                where('tenantId', '==', tenantId.value),
                where('userId', '==', user.value.uid),
                orderBy('startTime', 'desc')
            ];

            if (goalId) {
                constraints.push(where('goalId', '==', goalId));
            }

            // Limit to reasonable amount for history if not comprehensive reporting
            // constraints.push(limit(50)); 

            logs.value = await getAll(constraints);
        } catch (e: any) {
            console.error(e);
            error.value = e.message;
        } finally {
            isLoading.value = false;
        }
    };

    const startTracking = async (item: { id: string, type: 'goal' | 'task' | 'project', projectId?: string, title: string }) => {
        if (activeLog.value) {
            // Auto-stop previous? Or error?
            // Let's auto-stop for better UX
            await stopTracking();
        }

        isLoading.value = true;
        try {
            if (!tenantId.value || !user.value) throw new Error("No context");

            const newLog = new TimeLog({
                tenantId: tenantId.value,
                userId: user.value.uid,
                goalId: item.type === 'goal' ? item.id : null,
                taskId: item.type === 'task' ? item.id : null,
                projectId: item.projectId || (item.type === 'project' ? item.id : null),
                modelType: item.type,
                startTime: new Date(),
                endTime: null,
                description: `Working on ${item.title}`
            });

            const created = await create(newLog);
            activeLog.value = created;
            // Add to logs if showing current
            logs.value.unshift(created);
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    const stopTracking = async () => {
        if (!activeLog.value) return;

        isLoading.value = true;
        try {
            const endTime = new Date();
            const startTime = new Date(activeLog.value.startTime);
            const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

            await update(activeLog.value.id, {
                endTime,
                duration
            });

            // Update local state
            const idx = logs.value.findIndex(l => l.id === activeLog.value!.id);
            if (idx !== -1) {
                const logData = activeLog.value!.toJSON();
                // Ensure dates are dates for constructor
                const finishedLog = new TimeLog({
                    ...logData,
                    createdAt: logData.createdAt instanceof Date ? logData.createdAt : undefined,
                    updatedAt: new Date(),
                    endTime,
                    duration
                });
                logs.value[idx] = finishedLog;
            }

            activeLog.value = null;
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    return {
        logs,
        activeLog,
        isLoading,
        error,
        init,
        fetchLogs,
        startTracking,
        stopTracking
    };
};
