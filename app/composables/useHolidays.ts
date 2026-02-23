import { holidays } from '../../config/holidays';
import { useToast } from '#imports';

export const useHolidays = () => {
    const toast = useToast();

    const checkHolidays = () => {
        // Ensuring this only runs on the client side
        if (!import.meta.client) return;

        const today = new Date();
        const currentMonth = today.getMonth() + 1; // 0-indexed
        const currentDay = today.getDate();
        const currentYear = today.getFullYear();

        const holiday = holidays.find(
            (h) => h.month === currentMonth && h.day === currentDay
        );

        if (holiday) {
            const storageKey = `ilytat_holiday_toast_${holiday.month}_${holiday.day}_${currentYear}`;
            const hasShown = localStorage.getItem(storageKey);

            if (!hasShown) {
                // Show the toast
                const toastMessage = `${holiday.title}: ${holiday.message}`;
                const toastType = holiday.theme || 'info';

                toast.add(toastMessage, toastType as 'success' | 'error' | 'warning' | 'info' | 'dev', null, {
                    duration: 10000, // Show for a bit longer
                });

                // Mark as shown for today
                localStorage.setItem(storageKey, 'true');
            }
        }
    };

    return {
        checkHolidays,
    };
};
