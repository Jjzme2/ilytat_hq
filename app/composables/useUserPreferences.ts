import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useFirestore } from 'vuefire';
import { UserPreference, type DashboardWidget } from '~/models/UserPreference';
import { useUser } from './useUser';

export const useUserPreferences = () => {
    const { user } = useUser();
    const { db } = useFirebase();

    // State
    const preferences = useState<UserPreference | null>('user-preferences', () => null);
    const isLoading = useState<boolean>('user-preferences-loading', () => false);

    const getPreferencesRef = () => {
        if (!user.value?.uid || !db) return null;
        return doc(db, `users/${user.value.uid}/settings/preferences`);
    };

    const loadPreferences = async () => {
        // Ensure user is loaded first
        if (process.client && !user.value) {
            await useUser().ensureUserIsReady();
        }

        if (!user.value?.uid) return;

        isLoading.value = true;
        try {
            const docRef = getPreferencesRef();
            if (!docRef) return;

            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                preferences.value = new UserPreference(snapshot.data());
            } else {
                // Initialize default preferences
                const defaultPrefs = new UserPreference();
                // Ensure default layout has items if empty
                if (defaultPrefs.dashboardLayout.length === 0) {
                    // Default widget set
                    defaultPrefs.dashboardLayout = [
                        { id: 'pulse', enabled: true, order: 0 },
                        { id: 'inbox', enabled: true, order: 1 },
                        { id: 'tasks', enabled: true, order: 2 },
                        { id: 'projects', enabled: true, order: 3 },
                        { id: 'finance', enabled: true, order: 4 },
                        { id: 'schedule', enabled: true, order: 5 },
                        { id: 'ai', enabled: true, order: 6 }
                    ];
                }

                await setDoc(docRef, defaultPrefs.toJSON());
                preferences.value = defaultPrefs;
            }
        } catch (e) {
            console.error('Failed to load user preferences', e);
        } finally {
            isLoading.value = false;
        }
    };

    const updateDashboardLayout = async (layout: DashboardWidget[]) => {
        if (!preferences.value || !user.value?.uid) return;

        try {
            const docRef = getPreferencesRef();
            if (!docRef) return;

            const updatedPrefs = new UserPreference({
                ...preferences.value,
                dashboardLayout: layout
            });

            await updateDoc(docRef, { dashboardLayout: layout });
            preferences.value = updatedPrefs;
        } catch (e) {
            console.error('Failed to update dashboard layout', e);
            throw e;
        }
    };

    const toggleWidget = async (widgetId: string, enabled: boolean) => {
        if (!preferences.value) return;

        const currentLayout = [...preferences.value.dashboardLayout];
        const widgetIndex = currentLayout.findIndex(w => w.id === widgetId);

        if (widgetIndex >= 0) {
            const widget = currentLayout[widgetIndex];
            if (widget) {
                const updatedWidget: DashboardWidget = {
                    id: widget.id,
                    order: widget.order,
                    enabled: enabled
                };
                currentLayout[widgetIndex] = updatedWidget;
            }
        } else {
            // Add if missing (shouldn't happen with default init, but safe to allow)
            currentLayout.push({ id: widgetId, enabled, order: currentLayout.length });
        }

        await updateDashboardLayout(currentLayout);
    };

    return {
        preferences,
        isLoading,
        loadPreferences,
        updateDashboardLayout,
        toggleWidget
    };
};
