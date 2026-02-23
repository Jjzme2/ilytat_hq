/**
 * Configuration for major world holidays.
 * Used to display festive toast messages to users.
 */

export interface HolidayConfig {
    month: number; // 1-12
    day: number; // 1-31
    title: string;
    message: string;
    icon?: string;
    theme?: 'success' | 'error' | 'warning' | 'info' | 'dev';
}

export const holidays: HolidayConfig[] = [
    {
        month: 1,
        day: 1,
        title: 'Happy New Year!',
        message: 'Wishing you a fantastic year ahead from all of us at HQ.',
        icon: 'ph:sparkle-fill',
        theme: 'info',
    },
    {
        month: 2,
        day: 14,
        title: 'Happy Valentine\'s Day!',
        message: 'Hope your day is filled with love and joy.',
        icon: 'ph:heart-fill',
        theme: 'error', // often red for valentine's
    },
    {
        month: 3,
        day: 17,
        title: 'Happy St. Patrick\'s Day!',
        message: 'Wishing you the luck of the Irish today.',
        icon: 'ph:clover-fill',
        theme: 'success', // green
    },
    {
        month: 4, // Earth Day is April 22
        day: 22,
        title: 'Happy Earth Day!',
        message: 'Let\'s cherish and protect our beautiful planet.',
        icon: 'ph:globe-hemisphere-west-fill',
        theme: 'success',
    },
    {
        month: 5, // May the 4th be with you
        day: 4,
        title: 'May the 4th be with you!',
        message: 'Have an out-of-this-world day.',
        icon: 'ph:rocket-launch-fill',
        theme: 'info',
    },
    {
        month: 10,
        day: 31,
        title: 'Happy Halloween!',
        message: 'Wishing you a spook-tacular day full of treats.',
        icon: 'ph:ghost-fill',
        theme: 'warning', // orange
    },
    {
        month: 12,
        day: 25,
        title: 'Merry Christmas!',
        message: 'Wishing you a season of joy and wonderful memories.',
        icon: 'ph:tree-evergreen-fill',
        theme: 'success',
    },
    {
        month: 12,
        day: 31,
        title: 'New Year\'s Eve',
        message: 'Here is to a great year behind us and an even better one ahead!',
        icon: 'ph:confetti-fill',
        theme: 'info',
    }
];
