
import { useCommandPalette } from '#imports'
import { quicklaunch } from '../../config/quicklaunch'

export default defineNuxtPlugin(() => {
    const { registerCommand, registerGroup, open, toggle } = useCommandPalette();
    const router = useRouter();

    // Register Groups
    // registerGroup({ id: 'navigation', label: 'Navigation' }); // Already default
    // registerGroup({ id: 'actions', label: 'Actions' });

    // Navigation Commands
    registerCommand({
        id: 'nav-dashboard',
        label: 'Dashboard',
        icon: 'i-heroicons-home',
        group: 'Navigation',
        action: () => router.push('/')
    });

    registerCommand({
        id: 'nav-admin',
        label: 'Admin Panel',
        icon: 'i-heroicons-cog',
        group: 'Navigation',
        action: () => router.push('/admin')
    });

    registerCommand({
        id: 'nav-inbox',
        label: 'Inbox',
        icon: 'i-heroicons-inbox',
        group: 'Navigation',
        action: () => router.push('/inbox')
    });

    registerCommand({
        id: 'nav-projects',
        label: 'Projects',
        icon: 'i-heroicons-rectangle-group',
        group: 'Navigation',
        action: () => router.push('/projects')
    });

    registerCommand({
        id: 'nav-documents',
        label: 'Documents',
        icon: 'i-heroicons-document-text',
        group: 'Navigation',
        action: () => router.push('/foundry')
    });

    registerCommand({
        id: 'nav-settings',
        label: 'Settings',
        icon: 'i-heroicons-adjustments-horizontal',
        group: 'Navigation',
        action: () => router.push('/settings')
    });

    registerCommand({
        id: 'nav-finance',
        label: 'Finance',
        icon: 'i-heroicons-banknotes',
        group: 'Navigation',
        action: () => router.push('/finance')
    });

    // Quick Capture — creation shortcuts
    registerCommand({
        id: 'create-project',
        label: 'New Project',
        icon: 'i-heroicons-plus-circle',
        group: 'Quick Capture',
        action: () => router.push('/projects?create=true')
    });

    registerCommand({
        id: 'create-document',
        label: 'New Document',
        icon: 'i-heroicons-document-plus',
        group: 'Quick Capture',
        action: () => router.push('/foundry?create=true')
    });

    // Quick Launch — external links from config
    for (const [label, url] of Object.entries(quicklaunch)) {
        registerCommand({
            id: `ql-${label.replace(/\s+/g, '-').toLowerCase()}`,
            label: label,
            icon: 'i-heroicons-arrow-top-right-on-square',
            group: 'Quick Launch',
            action: () => window.open(url, '_blank')
        });
    }

    // Theme Actions
    registerCommand({
        id: 'action-theme-toggle',
        label: 'Toggle Theme',
        icon: 'i-heroicons-sun',
        group: 'Actions',
        action: () => {
            // Assuming useThemeStore is auto-imported or available
            const themeStore = useThemeStore();
            themeStore.toggleTheme();
        }
    });

    registerCommand({
        id: 'action-logout',
        label: 'Sign Out',
        icon: 'i-heroicons-arrow-left-on-rectangle',
        group: 'Actions',
        action: () => {
            const { signOut } = useUser();
            signOut();
        }
    });

    // Dev Tools (conditional?)
    if (process.dev) {
        registerCommand({
            id: 'dev-test-toast',
            label: 'Test Dev Toast',
            icon: 'i-heroicons-beaker',
            group: 'Development',
            action: () => {
                const { dev } = useToast();
                dev('Test Dev Toast', { foo: 'bar', timestamp: Date.now() });
            }
        });

        registerCommand({
            id: 'dev-test-success',
            label: 'Test Success Toast',
            icon: 'i-heroicons-check-circle',
            group: 'Development',
            action: () => {
                const { success } = useToast();
                success('Operation successful!');
            }
        });
    }

});

