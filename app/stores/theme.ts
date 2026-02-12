import { defineStore } from 'pinia';
import { useColorMode } from '@vueuse/core';

export const useThemeStore = defineStore('theme', () => {
    const mode = useColorMode({
        emitAuto: true,
        modes: {
            light: 'light',
            dark: 'dark',
            // Add more themes here if needed, e.g., 'sepia', 'cyberpunk'
        },
    });

    const isDark = computed(() => mode.value === 'dark');

    function toggleTheme() {
        mode.value = mode.value === 'dark' ? 'light' : 'dark';
    }

    function SetTheme(newTheme: 'light' | 'dark' | 'auto') {
        mode.value = newTheme;
    }

    return {
        mode,
        isDark,
        toggleTheme,
        SetTheme,
    };
});
