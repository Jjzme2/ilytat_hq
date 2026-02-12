import { reactive, onMounted, onUnmounted, toRefs } from 'vue';

// --- Configuration ---
const BREAKPOINTS = {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
};

// --- Models ---
export interface DeviceState {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isTouch: boolean;
    isSSR: boolean;
}

// --- Composable ---
export const useDevice = () => {
    const deviceState = reactive<DeviceState>({
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        isTouch: false,
        isSSR: true,
    });

    const updateState = () => {
        if (typeof window === 'undefined') return;

        const width = window.innerWidth;
        deviceState.isSSR = false;
        deviceState.isMobile = width < BREAKPOINTS.mobile;
        deviceState.isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
        deviceState.isDesktop = width >= BREAKPOINTS.tablet;
        deviceState.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };

    onMounted(() => {
        updateState();
        window.addEventListener('resize', updateState);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', updateState);
    });

    return { ...toRefs(deviceState) };
};
