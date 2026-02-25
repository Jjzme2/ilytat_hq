/**
 * Splash Screen Registry
 *
 * WHY: Extensible system for adding new splash variants.
 * To add a new splash screen:
 *   1. Create a new .vue component in this folder
 *   2. Add it to the `variants` array below
 *   3. Done — it will randomly appear on app load
 *
 * Each variant receives these props:
 *   - brandName: string  — The organization brand name
 *   - brandInitials: string  — e.g. "HQ"
 */

import type { Component } from 'vue';

export interface SplashVariant {
    /** Unique ID for this variant */
    id: string;
    /** Human-readable name (shown in dev/debug) */
    name: string;
    /** Whether this variant supports mouse interaction */
    interactive: boolean;
    /** The Vue component to render */
    component: Component;
}

// Lazy-load each variant so they don't bloat the main bundle
const variants: SplashVariant[] = [
    {
        id: 'constellation',
        name: 'Constellation',
        interactive: true,
        component: defineAsyncComponent(() => import('./SplashConstellation.vue')),
    },
    {
        id: 'gradient-morph',
        name: 'Gradient Morph',
        interactive: false,
        component: defineAsyncComponent(() => import('./SplashGradientMorph.vue')),
    },
    {
        id: 'terminal-boot',
        name: 'Terminal Boot',
        interactive: false,
        component: defineAsyncComponent(() => import('./SplashTerminalBoot.vue')),
    },
    {
        id: 'waveform',
        name: 'Waveform',
        interactive: false,
        component: defineAsyncComponent(() => import('./SplashWaveform.vue')),
    },
];

/** Pick a random splash variant */
export const getRandomSplash = (): SplashVariant => {
    const idx = Math.floor(Math.random() * variants.length);
    return variants[idx]!;
};

/** Get all registered variants (useful for user prefs or preview) */
export const getAllSplashVariants = (): SplashVariant[] => [...variants];

/** Get a specific variant by ID */
export const getSplashById = (id: string): SplashVariant | undefined => {
    return variants.find(v => v.id === id);
};
