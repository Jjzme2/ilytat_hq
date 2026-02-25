import { defineNuxtPlugin } from '#app';
import { shallowRef, resolveComponent } from 'vue';

import AdminSchedule from '~/components/admin/tabs/AdminSchedule.vue';
import AdminFinance from '~/components/admin/tabs/AdminFinance.vue';

export default defineNuxtPlugin((nuxtApp) => {
    // We only register if we are in a context where useAdminPanel might be available.
    // It's safe to call registerTab if the composable is available.
    // Since this is a client-side plugin (or universal), logic runs on startup.

    // Check if useAdminPanel exists (it should via auto-import if layer works)
    // But TS might not know it without types.
    // I will assume it works.

    const { registerTab } = useAdminPanel();

    // Organization settings removed as part of moving to single user

    // Register New Analytics/Management Modules

    registerTab({
        id: 'schedule',
        label: 'Schedule',
        icon: '📅',
        component: shallowRef(AdminSchedule),
        order: 16
    });

    registerTab({
        id: 'finance',
        label: 'Finance',
        icon: '💰',
        component: shallowRef(AdminFinance),
        order: 70
    });
});
