import { defineNuxtPlugin } from '#app';
import { shallowRef, resolveComponent } from 'vue';
import OrganizationSettings from '~/components/admin/tabs/OrganizationSettings.vue';
import AdminGoals from '~/components/admin/tabs/AdminGoals.vue';
import AdminTasks from '~/components/admin/tabs/AdminTasks.vue';
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

    registerTab({
        id: 'organization',
        label: 'Organization',
        icon: '🏢', // Same icon as Tenant or different? User said "Organization".
        component: shallowRef(OrganizationSettings), // Use shallowRef to avoid reactivity overhead on component definition
        order: 25 // Between Projects (20) and Tenant (30, if Tenant tab stays) 
        // or replace Tenant tab? 
        // The user said "Moved to admin/tenants page/tab". 
        // Keep 'Organization' label or 'Tenant'?
        // I'll stick to 'Organization' for now as per component name.
    });

    // Register New Analytics/Management Modules
    registerTab({
        id: 'goals',
        label: 'Goals',
        icon: '🎯',
        component: shallowRef(AdminGoals),
        order: 15
    });

    registerTab({
        id: 'tasks',
        label: 'Tasks',
        icon: '✅',
        component: shallowRef(AdminTasks),
        order: 14 // Before Goals
    });

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
