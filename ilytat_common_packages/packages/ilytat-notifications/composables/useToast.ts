
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'dev';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastAction {
    label: string;
    onClick: () => void;
}

export interface ToastOptions {
    duration?: number; // ms, default 3000
    position?: ToastPosition;
    dismissible?: boolean;
    action?: ToastAction;
}

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    data?: any; // For dev debugging
    position: ToastPosition;
    duration: number;
    dismissible: boolean;
    createdAt: number;
    action?: ToastAction;
}

const toasts = ref<Toast[]>([]);

// Default Configurations
const DEFAULT_USER_POSITION: ToastPosition = 'top-right';
const DEFAULT_DEV_POSITION: ToastPosition = 'bottom-left';
const DEFAULT_DURATION = 3000;
const DEFAULT_DEV_DURATION = 5000;

export const useToast = () => {

    const add = (message: string, type: ToastType, data?: any, options: ToastOptions = {}) => {
        // Dev mode guard — suppress dev toasts in production
        if (type === 'dev' && import.meta.env?.PROD) return;

        const id = Math.random().toString(36).substring(2, 9);
        const position = options.position || (type === 'dev' ? DEFAULT_DEV_POSITION : DEFAULT_USER_POSITION);

        const toast: Toast = {
            id,
            message,
            type,
            data,
            position,
            duration: options.duration || (type === 'dev' ? DEFAULT_DEV_DURATION : DEFAULT_DURATION),
            dismissible: options.dismissible ?? true,
            createdAt: Date.now(),
            action: options.action
        };

        toasts.value.push(toast);

        if (toast.duration > 0) {
            setTimeout(() => {
                remove(id);
            }, toast.duration);
        }

        // Console log for dev toasts
        if (type === 'dev') {
            console.log(`[DevToast] ${message}`, data || '');
        }
    };

    const remove = (id: string) => {
        const index = toasts.value.findIndex(t => t.id === id);
        if (index !== -1) {
            toasts.value.splice(index, 1);
        }
    };

    const success = (message: string, options?: ToastOptions) => add(message, 'success', null, options);
    const error = (message: string, options?: ToastOptions) => add(message, 'error', null, options);
    const info = (message: string, options?: ToastOptions) => add(message, 'info', null, options);
    const warning = (message: string, options?: ToastOptions) => add(message, 'warning', null, options);

    // Dev toast
    const dev = (message: string, data?: any, options?: ToastOptions) => add(message, 'dev', data, options);

    return {
        toasts,
        add,
        remove,
        success,
        error,
        info,
        warning,
        dev
    };
};
