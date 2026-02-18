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
