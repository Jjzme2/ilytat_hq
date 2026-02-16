/**
 * Plugin to suppress specific hydration warnings that are expected due to 
 * client-side architecture (e.g., Auth redirection changing layout).
 */
export default defineNuxtPlugin((nuxtApp) => {
    if (import.meta.dev) {
        const originalWarn = console.warn;

        console.warn = (...args) => {
            const msg = args.join(' ');

            // Suppress Hydration node mismatch warnings caused by layout switching
            if (msg.includes('Hydration node mismatch') ||
                msg.includes('Hydration children mismatch') ||
                msg.includes('Hydration class mismatch')) {
                return;
            }

            originalWarn(...args);
        };
    }
});
