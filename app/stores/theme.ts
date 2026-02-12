import { defineStore } from 'pinia';
import { useColorMode, useStorage } from '@vueuse/core';
import { THEMES, type Theme } from '~/data/themes';
import { doc, updateDoc } from 'firebase/firestore';

export const useThemeStore = defineStore('theme', () => {
    // Basic Light/Dark mode handler (manages .dark class)
    const mode = useColorMode({
        emitAuto: true,
        modes: {
            light: 'light',
            dark: 'dark',
        },
    });

    // Theme State - Persist locally by default
    const activeThemeId = useStorage('active-theme-id', 'light-default');
    const savedThemeIds = useStorage<string[]>('saved-theme-ids', ['light-default', 'dark-default']);

    // Computed
    const activeTheme = computed(() => THEMES.find(t => t.id === activeThemeId.value) || THEMES[0]);
    const isDark = computed(() => activeTheme.value.base === 'dark');
    const savedThemes = computed(() => THEMES.filter(t => savedThemeIds.value.includes(t.id)));

    // Internal helper to apply CSS vars without side effects (DB save)
    function applyThemeInternal(themeId: string) {
        const theme = THEMES.find(t => t.id === themeId);
        if (!theme) return;

        activeThemeId.value = theme.id;
        mode.value = theme.base;

        if (import.meta.client) {
            const root = document.documentElement;
            Object.entries(theme.colors).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });

             // Apply extra styles if any
            if (theme.styles) {
                 Object.entries(theme.styles).forEach(([key, value]) => {
                    root.style.setProperty(key, value);
                 });
            }
        }
    }

    // Public action to set theme (and save preference)
    function setTheme(themeId: string) {
        applyThemeInternal(themeId);
        updateUserPreferences();
    }

    // Toggle logic (cycles through saved themes)
    function toggleTheme() {
        const currentIndex = savedThemeIds.value.indexOf(activeThemeId.value);
        let nextIndex = currentIndex + 1;
        if (nextIndex >= savedThemeIds.value.length) {
            nextIndex = 0;
        }
        setTheme(savedThemeIds.value[nextIndex]);
    }

    function toggleSavedTheme(themeId: string) {
        let updated = false;
        if (savedThemeIds.value.includes(themeId)) {
            // Remove
            // Ensure at least one theme remains (or fallback to default)
            if (savedThemeIds.value.length > 1) {
                savedThemeIds.value = savedThemeIds.value.filter(id => id !== themeId);
                updated = true;
            }
        } else {
            // Add
            if (savedThemeIds.value.length < 10) {
                savedThemeIds.value = [...savedThemeIds.value, themeId];
                updated = true;
            } else {
                return false; // Limit reached
            }
        }

        if (updated) {
            updateUserPreferences();
        }
        return true;
    }

    // Sync with User Profile in Firestore
    async function updateUserPreferences() {
        const { user } = useUser();
        const db = useFirestore();

        if (user.value && user.value.uid) {
            try {
                const userRef = doc(db, 'users', user.value.uid);
                await updateDoc(userRef, {
                    activeThemeId: activeThemeId.value,
                    savedThemeIds: savedThemeIds.value
                });
            } catch (e) {
                console.error('Failed to save theme preferences', e);
            }
        }
    }

    // Watch user changes to load their preferences
    const { user } = useUser();
    watch(user, (newUser) => {
        if (newUser) {
            // Load from user profile
            let themeChanged = false;

            if (newUser.activeThemeId && newUser.activeThemeId !== activeThemeId.value) {
                applyThemeInternal(newUser.activeThemeId);
                themeChanged = true;
            }

            if (newUser.savedThemeIds && JSON.stringify(newUser.savedThemeIds) !== JSON.stringify(savedThemeIds.value)) {
                savedThemeIds.value = newUser.savedThemeIds;
            }
        }
    }, { immediate: true });

    // Initialize on client mount
    if (import.meta.client) {
        applyThemeInternal(activeThemeId.value);
    }

    return {
        activeThemeId,
        savedThemeIds,
        activeTheme,
        isDark,
        savedThemes,
        setTheme,
        toggleTheme,
        toggleSavedTheme,
    };
});
