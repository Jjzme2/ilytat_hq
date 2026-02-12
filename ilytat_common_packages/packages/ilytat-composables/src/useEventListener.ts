import { onMounted, onUnmounted, isRef, unref, watch } from 'vue';
import type { Ref } from 'vue';

type Target = Window | Document | HTMLElement | Ref<HTMLElement | null | undefined> | null | undefined;

export function useEventListener(
    target: Target,
    event: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
) {
    let cleanup: (() => void) | undefined;

    const cleanupListener = () => {
        if (cleanup) {
            cleanup();
            cleanup = undefined;
        }
    };

    const register = (el: any) => {
        cleanupListener();
        if (el) {
            el.addEventListener(event, listener, options);
            cleanup = () => el.removeEventListener(event, listener, options);
        }
    };

    const stop = () => {
        cleanupListener();
    };

    if (isRef(target)) {
        watch(target, (el) => {
            register(el);
        }, { immediate: true });
    } else {
        onMounted(() => {
            register(target);
        });
    }

    onUnmounted(() => {
        stop();
    });

    return stop;
}
