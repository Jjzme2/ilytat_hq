
import { useCommandPalette } from '#imports'
import { quicklaunch } from '../../config/quicklaunch'

export default defineNuxtPlugin(() => {
    const { registerCommands, registerGroup, open, toggle } = useCommandPalette();
    const router = useRouter();

    // Register Groups
    // registerGroup({ id: 'navigation', label: 'Navigation' }); // Already default
    // registerGroup({ id: 'actions', label: 'Actions' });

    // Navigation Commands
    const navCommands = [
        {
            id: 'nav-dashboard',
            label: 'Dashboard',
            icon: 'i-heroicons-home',
            group: 'Navigation',
            action: () => router.push('/')
        },
        {
            id: 'nav-admin',
            label: 'Admin Panel',
            icon: 'i-heroicons-cog',
            group: 'Navigation',
            action: () => router.push('/admin')
        },
        {
            id: 'nav-inbox',
            label: 'Inbox',
            icon: 'i-heroicons-inbox',
            group: 'Navigation',
            action: () => router.push('/inbox')
        },
        {
            id: 'nav-projects',
            label: 'Projects',
            icon: 'i-heroicons-rectangle-group',
            group: 'Navigation',
            action: () => router.push('/projects')
        },
        {
            id: 'nav-documents',
            label: 'Documents',
            icon: 'i-heroicons-document-text',
            group: 'Navigation',
            action: () => router.push('/documents')
        },
        {
            id: 'nav-settings',
            label: 'Settings',
            icon: 'i-heroicons-adjustments-horizontal',
            group: 'Navigation',
            action: () => router.push('/settings')
        },
        {
            id: 'nav-finance',
            label: 'Finance',
            icon: 'i-heroicons-banknotes',
            group: 'Navigation',
            action: () => router.push('/finance')
        }
    ];

    // Quick Capture — creation shortcuts
    const captureCommands = [
        {
            id: 'create-project',
            label: 'New Project',
            icon: 'i-heroicons-plus-circle',
            group: 'Quick Capture',
            action: () => router.push('/projects?create=true')
        },
        {
            id: 'create-document',
            label: 'New Document',
            icon: 'i-heroicons-document-plus',
            group: 'Quick Capture',
            action: () => router.push('/documents?create=true')
        }
    ];

    // Quick Launch — external links from config
    const quickLaunchCommands = Object.entries(quicklaunch).map(([label, url]) => ({
        id: `ql-${label.replace(/\s+/g, '-').toLowerCase()}`,
        label: label,
        icon: 'i-heroicons-arrow-top-right-on-square',
        group: 'Quick Launch',
        action: () => window.open(url, '_blank')
    }));

    // Theme Actions
    const actionCommands = [
        {
            id: 'action-theme-toggle',
            label: 'Toggle Theme',
            icon: 'i-heroicons-sun',
            group: 'Actions',
            action: () => {
                // Assuming useThemeStore is auto-imported or available
                const themeStore = useThemeStore();
                themeStore.toggleTheme();
            }
        },
        {
            id: 'action-logout',
            label: 'Sign Out',
            icon: 'i-heroicons-arrow-left-on-rectangle',
            group: 'Actions',
            action: () => {
                const { signOut } = useUser();
                signOut();
            }
        }
    ];

    // Register all initial commands in one batch
    registerCommands([
        ...navCommands,
        ...captureCommands,
        ...quickLaunchCommands,
        ...actionCommands
    ]);

    // Dev Tools (conditional?)
    if (process.dev) {
        registerCommands([
            {
                id: 'dev-test-toast',
                label: 'Test Dev Toast',
                icon: 'i-heroicons-beaker',
                group: 'Development',
                action: () => {
                    const { dev } = useToast();
                    dev('Test Dev Toast', { foo: 'bar', timestamp: Date.now() });
                }
            },
            {
                id: 'dev-test-success',
                label: 'Test Success Toast',
                icon: 'i-heroicons-check-circle',
                group: 'Development',
                action: () => {
                    const { success } = useToast();
                    success('Operation successful!');
                }
            }
        ]);
    }

});
