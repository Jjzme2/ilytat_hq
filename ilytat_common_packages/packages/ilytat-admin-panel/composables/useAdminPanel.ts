import { useState } from '#app';
import type { Component } from 'vue';

export interface AdminTab {
    id: string;
    label: string;
    component: Component | string; // Allow string for component name if needed, or raw component
    icon?: string;
    order?: number;
}

export const useAdminPanel = () => {
    const tabs = useState<AdminTab[]>('admin-panel-tabs', () => []);
    const activeTabId = useState<string>('admin-panel-active-tab', () => '');

    const registerTab = (tab: AdminTab) => {
        if (!tabs.value.find(t => t.id === tab.id)) {
            tabs.value.push(tab);
            // Sort by order
            tabs.value.sort((a, b) => (a.order || 99) - (b.order || 99));
        }

        // Set first tab as active if none selected
        if (!activeTabId.value && tabs.value.length > 0) {
            activeTabId.value = tabs.value[0].id;
        }
    };

    const setActiveTab = (id: string) => {
        activeTabId.value = id;
    };

    const activeTab = computed(() => tabs.value.find(t => t.id === activeTabId.value));

    return {
        tabs,
        activeTabId,
        registerTab,
        setActiveTab,
        activeTab
    };
};
