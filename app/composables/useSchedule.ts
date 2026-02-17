import { ref, computed } from 'vue';
import { Event } from '~/models/Event';
import { Task } from '~/models/Task';
import { Goal } from '~/models/Goal';
import { useFirestoreRepository } from './useFirestoreRepository';
import { useTasks } from './useTasks';
import { useGoals } from './useGoals';
import { useTenant } from './useTenant';
import { useUser } from './useUser';
import { where, orderBy, Timestamp, type QueryConstraint } from 'firebase/firestore';
import { startOfMonth, endOfMonth, isSameDay } from 'date-fns';

export const useSchedule = () => {
    const { tenantId } = useTenant();
    const { user } = useUser();

    // Repositories
    const {
        getAll: getAllEvents,
        create: createEventRepo,
        update: updateEventRepo,
        remove: removeEventRepo
    } = useFirestoreRepository<Event>('events', (data) => new Event(data));

    const { fetchTasks } = useTasks();
    const { fetchGoals } = useGoals();

    // State
    const events = ref<Event[]>([]);
    const tasks = ref<Task[]>([]);
    const goals = ref<Goal[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Filter
    const currentDate = ref(new Date());

    // Actions
    const fetchSchedule = async (start: Date, end: Date) => {
        isLoading.value = true;
        error.value = null;
        try {
            if (!tenantId.value || !user.value) return;

            // Fetch Events
            // Firestore doesn't support logical OR for range clauses easily on different fields/collections
            // So we fetch by range if possible, or just recent/all if volume is low.
            // For now, let's fetch events within the tenant. Ideally we filter by range.
            // Simplified: Fetch all future/recent events for now or just all if reasonable.
            // Proper way: where('start', '>=', start), where('start', '<=', end)
            // Restricted to user's own events now

            const eventConstraints: QueryConstraint[] = [
                where('tenantId', '==', tenantId.value),
                where('userId', '==', user.value.uid),
                // where('start', '>=', Timestamp.fromDate(start)), // Needs index
                // where('start', '<=', Timestamp.fromDate(end))    // Needs index
            ];

            // Allow fetching all for now to avoid needing composite indexes immediately for every combo
            // Client-side filtering is acceptable for MVP volume
            const allEvents = await getAllEvents(eventConstraints);
            events.value = allEvents.filter(e => {
                const eStart = new Date(e.start);
                return eStart >= start && eStart <= end;
            });

            // Fetch Tasks (with due dates)
            // Tasks might be tasks assigned to user or all tenant tasks?
            // "Inherit from all facets... user would be able to easily create... check their time"
            // Let's get tasks assigned to user OR created by user
            await fetchTasks('', [where('dueDate', '!=', null)]);
            // Note: fetchTasks uses useTasks which stores in its own state `tasks`. 
            // We need to access that or return it. `fetchTasks` returns the array.
            // But useTasks is a composable that might share state or be new instance.
            // The `useTasks` I saw exports `tasks` ref. 
            // Let's re-use the `useTasks` logic but we need to call it effectively.

            // To be safe and clean, let's just use the `tasks` returned by `fetchTasks`
            // But `fetchTasks` in `useTasks` requires `projectId`.
            // The existing `useTasks` is project-scoped: `fetchTasks(projectId, ...)`
            // We need a way to fetch ALL tasks for a user schedule, across projects.
            // We might need to extend `useTasks` or use repository directly here.

            // Let's use repository directly for cross-project tasks if `useTasks` is strict.
            // checking useTasks... it takes `projectId`.
            // modifying `useTasks` to allow optional projectId would be better, but let's just use repository here to avoid breaking changes there for now.
            // Actually, `useTasks` is: fetchTasks(projectId, constraints). It adds `where('projectId', '==', projectId)`.
            // So we cannot use it for "All Projects".

            // We will implement a quick fetch for tasks here.
            const { getAll: getAllTasks } = useFirestoreRepository<Task>('tasks', (data) => new Task(data));
            const userTasks = await getAllTasks([
                where('tenantId', '==', tenantId.value),
                where('assigneeId', '==', user.value?.uid),
                where('status', '!=', 'completed'), // Maybe? Or include completed?
                // where('dueDate', '!=', null) // Firestore limitation: != null and other filters
            ]);

            tasks.value = userTasks.filter(t => t.dueDate && new Date(t.dueDate) >= start && new Date(t.dueDate) <= end);

            // Goals
            const { getAll: getAllGoals } = useFirestoreRepository<Goal>('goals', (data) => new Goal(data));
            // Goals assigned to user? Goals don't have assignee usually, maybe owner?
            // checking Goal model... `createdBy` or maybe just show all project goals?
            // User request: "inherit from all facets... schedule for EACH USER"
            // Typically goals are project/team level.
            // Let's show goals that the user is "driving" or just all tenant goals they have access to?
            // For now, let's fetch all tenant goals with a deadline.
            const allGoals = await getAllGoals([where('tenantId', '==', tenantId.value)]);
            goals.value = allGoals.filter(g => g.targetDate && new Date(g.targetDate) >= start && new Date(g.targetDate) <= end);

        } catch (e: any) {
            console.error(e);
            error.value = e.message;
        } finally {
            isLoading.value = false;
        }
    };

    const createEvent = async (eventData: Partial<Event>) => {
        isLoading.value = true;
        try {
            if (!tenantId.value || !user.value) throw new Error("No context");

            const newEvent = new Event({
                ...eventData,
                tenantId: tenantId.value,
                userId: user.value.uid,
                start: eventData.start || new Date(),
                end: eventData.end || new Date(new Date().getTime() + 3600000) // 1 hour default
            });

            const created = await createEventRepo(newEvent);
            events.value.push(created);
            return created;
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    const updateEvent = async (id: string, updates: Partial<Event>) => {
        try {
            await updateEventRepo(id, updates);
            const idx = events.value.findIndex(e => e.id === id);
            if (idx !== -1) {
                // simple merge for local update
                const existing = events.value[idx].toJSON();
                events.value[idx] = new Event({ ...existing, ...updates });
            }
        } catch (e: any) {
            error.value = e.message;
            throw e;
        }
    };

    const deleteEvent = async (id: string) => {
        try {
            await removeEventRepo(id);
            events.value = events.value.filter(e => e.id !== id);
        } catch (e: any) {
            error.value = e.message;
            throw e;
        }
    }

    // Getters
    const items = computed(() => {
        const scheduleItems = [
            ...events.value.map(e => ({ ...e.toJSON(), _type: 'event', _date: new Date(e.start) })),
            ...tasks.value.map(t => ({ ...t.toJSON(), _type: 'task', _date: new Date(t.dueDate!) })),
            ...goals.value.map(g => ({ ...g.toJSON(), _type: 'goal', _date: new Date(g.targetDate!) }))
        ];

        return scheduleItems.sort((a, b) => a._date.getTime() - b._date.getTime());
    });

    return {
        events,
        tasks,
        goals,
        items,
        isLoading,
        error,
        fetchSchedule,
        createEvent,
        updateEvent,
        deleteEvent
    };
};
