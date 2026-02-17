import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from '#app';
import { appConfig } from '../../config/app';
import { useCurrentUser } from 'vuefire';
import { signOut } from 'firebase/auth';
import { useFirebaseAuth } from 'vuefire';

export const useSessionTimeout = () => {
    const router = useRouter();
    const auth = useFirebaseAuth();
    const user = useCurrentUser();

    const { warning, remove, toasts } = useToast();

    // Config
    const TIMEOUT_MS = (appConfig.session.timeoutMinutes || 30) * 60 * 1000;
    const WARNING_MS = (appConfig.session.warningMinutes || 2) * 60 * 1000;
    const CHECK_INTERVAL_MS = 1000; // Check every second for better precision on warning

    // State
    const lastActivity = ref(Date.now());
    const intervalId = ref<NodeJS.Timeout | null>(null);
    const warningShown = ref(false);
    const warningToastId = ref<string | null>(null);
    const lastWarningMinute = ref<number | null>(null);

    const updateActivity = () => {
        if (!user.value) return;

        const now = Date.now();
        const timeSinceActivity = now - lastActivity.value;

        // 1. Strict Check: Has timeout ALREADY happened?
        if (timeSinceActivity > TIMEOUT_MS) {
            console.log('[Session] Timeout reached during activity check. Logging out.');
            logout(); // Immediate logout
            return;
        }

        // 2. Clear warning if it was shown
        if (warningShown.value) {
            if (warningToastId.value) {
                remove(warningToastId.value);
                warningToastId.value = null;
            }
            warningShown.value = false;
            lastWarningMinute.value = null;
        }

        // 3. Throttle updates to local state to avoid performance hits
        // Only update if more than 1 second has passed since last recorded activity
        if (now - lastActivity.value > 1000) {
            lastActivity.value = now;
        }
    };

    const checkTimeout = async () => {
        if (!user.value) return;

        const now = Date.now();
        const timeSinceActivity = now - lastActivity.value;



        // Check for Timeout
        if (timeSinceActivity > TIMEOUT_MS) {
            console.log('[Session] Timeout reached (periodic check). Logging out.');
            if (warningToastId.value) remove(warningToastId.value); // Clean up toast
            await logout();
            return;
        }

        // Check for Warning
        // If we are within the warning window (timeSinceActivity > TIMEOUT - WARNING)
        if (timeSinceActivity > (TIMEOUT_MS - WARNING_MS)) {
            const remainingMs = TIMEOUT_MS - timeSinceActivity;
            const remainingMinutes = Math.ceil(remainingMs / 60000);

            // Update if we haven't shown warning OR the minute has changed
            if (!warningShown.value || remainingMinutes !== lastWarningMinute.value) {
                console.log(`[Session] Warning threshold reached. ${remainingMinutes}m remaining.`);

                const message = `You will be logged out in ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}.`;

                // Try to find existing toast
                const existingToast = warningToastId.value ? toasts.value.find(t => t.id === warningToastId.value) : null;

                if (existingToast) {
                    // Update in place
                    existingToast.message = message;
                } else {
                    // Create new
                    warning(message, {
                        duration: 0, // Persistent
                        dismissible: true
                    });

                    // Capture ID
                    const lastToast = toasts.value[toasts.value.length - 1];
                    if (lastToast) {
                        warningToastId.value = lastToast.id;
                    }
                }

                warningShown.value = true;
                lastWarningMinute.value = remainingMinutes;
            }
        }
    };

    const logout = async () => {
        if (auth) {
            await signOut(auth);
            router.push('/login?reason=timeout');
        }
    };

    const startMonitoring = () => {
        if (typeof window === 'undefined') return;

        // Listeners for activity
        // Note: We check timeout BEFORE updating activity to ensure we don't renew a dead session
        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keydown', updateActivity);
        window.addEventListener('click', updateActivity);
        window.addEventListener('scroll', updateActivity);
        window.addEventListener('touchstart', updateActivity);

        // Immediate check when tab becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                updateActivity();
            }
        });

        // Periodic check
        intervalId.value = setInterval(checkTimeout, CHECK_INTERVAL_MS);

        // Initial set
        lastActivity.value = Date.now();
    };

    const stopMonitoring = () => {
        if (typeof window === 'undefined') return;

        window.removeEventListener('mousemove', updateActivity);
        window.removeEventListener('keydown', updateActivity);
        window.removeEventListener('click', updateActivity);
        window.removeEventListener('scroll', updateActivity);
        window.removeEventListener('touchstart', updateActivity);

        if (intervalId.value) {
            clearInterval(intervalId.value);
            intervalId.value = null;
        }
    };

    // Reset timer when user logs in to prevent immediate loop
    // Only reset if transitioning from NO user to USER (login)
    // trying to avoid resetting on token refreshes if reference changes
    watch(user, (newUser, oldUser) => {
        if (newUser && !oldUser) {

            lastActivity.value = Date.now();
            warningShown.value = false;
            if (warningToastId.value) {
                remove(warningToastId.value);
                warningToastId.value = null;
            }
        }
    });

    return {
        startMonitoring,
        stopMonitoring,
        lastActivity
    };
};
