import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from '#app';
import { appConfig } from '../../config/app';
import { useCurrentUser } from 'vuefire';
import { signOut } from 'firebase/auth';
import { useFirebaseAuth } from 'vuefire';

export const useSessionTimeout = () => {
    const router = useRouter();
    const auth = useFirebaseAuth();
    const user = useCurrentUser();

    // Config
    const TIMEOUT_MS = (appConfig.session.timeoutMinutes || 30) * 60 * 1000;
    const CHECK_INTERVAL_MS = 60 * 1000; // Check every minute

    // State
    const lastActivity = ref(Date.now());
    const intervalId = ref<NodeJS.Timeout | null>(null);

    const updateActivity = () => {
        lastActivity.value = Date.now();
    };

    const checkTimeout = async () => {
        if (!user.value) return; // Only check if user is logged in

        const now = Date.now();
        const timeSinceActivity = now - lastActivity.value;

        if (timeSinceActivity > TIMEOUT_MS) {
            console.log('[Session] Timeout reached. Logging out.');
            await logout();
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
        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keydown', updateActivity);
        window.addEventListener('click', updateActivity);
        window.addEventListener('scroll', updateActivity);
        window.addEventListener('touchstart', updateActivity);

        // Periodic check
        intervalId.value = setInterval(checkTimeout, CHECK_INTERVAL_MS);

        // Initial tap
        updateActivity();
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

    return {
        startMonitoring,
        stopMonitoring,
        lastActivity
    };
};
