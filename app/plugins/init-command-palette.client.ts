
import { useCommandPalette } from '#imports'
import { quicklaunch } from '../../config/quicklaunch'

export default defineNuxtPlugin((nuxtApp) => {
    const { registerCommand, registerGroup, open, toggle, loadShortcutOverrides } = useCommandPalette();
    const router = useRouter();

    // -----------------------------------------------------------------------
    // Navigation Commands (with default shortcuts)
    // -----------------------------------------------------------------------
    registerCommand({
        id: 'nav-dashboard',
        label: 'Dashboard',
        icon: 'i-heroicons-home',
        shortcut: ['Ctrl', '1'],
        group: 'Navigation',
        action: () => router.push('/')
    });

    registerCommand({
        id: 'nav-projects',
        label: 'Projects',
        icon: 'i-heroicons-rectangle-group',
        shortcut: ['Ctrl', '2'],
        group: 'Navigation',
        action: () => router.push('/projects')
    });

    registerCommand({
        id: 'nav-schedule',
        label: 'Schedule',
        icon: 'i-heroicons-calendar-days',
        shortcut: ['Ctrl', '3'],
        group: 'Navigation',
        action: () => router.push('/schedule')
    });

    registerCommand({
        id: 'nav-documents',
        label: 'Documents',
        icon: 'i-heroicons-document-text',
        shortcut: ['Ctrl', '4'],
        group: 'Navigation',
        action: () => router.push('/documents')
    });

    registerCommand({
        id: 'nav-inbox',
        label: 'Inbox',
        icon: 'i-heroicons-inbox',
        shortcut: ['Ctrl', '5'],
        group: 'Navigation',
        action: () => router.push('/inbox')
    });

    registerCommand({
        id: 'nav-finance',
        label: 'Finance',
        icon: 'i-heroicons-banknotes',
        shortcut: ['Ctrl', '6'],
        group: 'Navigation',
        action: () => router.push('/finance')
    });

    registerCommand({
        id: 'nav-admin',
        label: 'Admin Panel',
        icon: 'i-heroicons-cog',
        group: 'Navigation',
        action: () => router.push('/admin')
    });

    registerCommand({
        id: 'nav-settings',
        label: 'Settings',
        icon: 'i-heroicons-adjustments-horizontal',
        shortcut: ['Ctrl', ','],
        group: 'Navigation',
        action: () => router.push('/settings')
    });

    registerCommand({
        id: 'nav-themes',
        label: 'Theme Gallery',
        icon: 'i-heroicons-swatch',
        group: 'Navigation',
        action: () => router.push('/themes')
    });

    registerCommand({
        id: 'nav-tasks',
        label: 'Tasks',
        icon: 'i-heroicons-check-circle',
        group: 'Navigation',
        action: () => router.push('/tasks')
    });

    registerCommand({
        id: 'nav-goals',
        label: 'Goals',
        icon: 'i-heroicons-flag',
        group: 'Navigation',
        action: () => router.push('/goals')
    });

    registerCommand({
        id: 'nav-foundry',
        label: 'AI Foundry',
        icon: 'i-heroicons-sparkles',
        group: 'Navigation',
        action: () => router.push('/foundry')
    });

    // -----------------------------------------------------------------------
    // Quick Capture — creation shortcuts
    // -----------------------------------------------------------------------
    registerCommand({
        id: 'create-project',
        label: 'New Project',
        icon: 'i-heroicons-plus-circle',
        shortcut: ['Ctrl', 'Shift', 'P'],
        group: 'Quick Capture',
        action: () => router.push('/projects?create=true')
    });

    registerCommand({
        id: 'create-document',
        label: 'New Document',
        icon: 'i-heroicons-document-plus',
        shortcut: ['Ctrl', 'Shift', 'D'],
        group: 'Quick Capture',
        action: () => router.push('/documents?create=true')
    });

    registerCommand({
        id: 'create-task',
        label: 'New Task',
        icon: 'i-heroicons-clipboard-document-check',
        shortcut: ['Ctrl', 'Shift', 'T'],
        group: 'Quick Capture',
        action: () => router.push('/tasks?create=true')
    });

    registerCommand({
        id: 'create-goal',
        label: 'New Goal',
        icon: 'i-heroicons-trophy',
        group: 'Quick Capture',
        action: () => router.push('/goals?create=true')
    });

    registerCommand({
        id: 'create-event',
        label: 'New Event',
        icon: 'i-heroicons-calendar',
        group: 'Quick Capture',
        action: () => router.push('/schedule?create=true')
    });

    registerCommand({
        id: 'compose-message',
        label: 'Compose Message',
        icon: 'i-heroicons-chat-bubble-left-ellipsis',
        shortcut: ['Ctrl', 'Shift', 'M'],
        group: 'Quick Capture',
        action: () => router.push('/inbox?compose=true')
    });

    // -----------------------------------------------------------------------
    // Finance Commands
    // -----------------------------------------------------------------------
    registerCommand({
        id: 'finance-add-transaction',
        label: 'Add Transaction',
        icon: 'i-heroicons-currency-dollar',
        group: 'Finance',
        action: () => router.push('/finance?action=add-transaction')
    });

    registerCommand({
        id: 'finance-add-account',
        label: 'Add Account',
        icon: 'i-heroicons-building-library',
        group: 'Finance',
        action: () => router.push('/finance?action=add-account')
    });

    registerCommand({
        id: 'finance-add-budget',
        label: 'New Budget',
        icon: 'i-heroicons-chart-pie',
        group: 'Finance',
        action: () => router.push('/finance?action=add-budget')
    });

    registerCommand({
        id: 'finance-overview',
        label: 'Financial Overview',
        icon: 'i-heroicons-presentation-chart-bar',
        group: 'Finance',
        action: () => router.push('/finance')
    });

    registerCommand({
        id: 'finance-budgets',
        label: 'Budget Progress',
        icon: 'i-heroicons-chart-bar',
        group: 'Finance',
        action: () => router.push('/finance#budgets')
    });

    // -----------------------------------------------------------------------
    // Quick Launch — external links from config
    // -----------------------------------------------------------------------
    for (const [label, url] of Object.entries(quicklaunch)) {
        registerCommand({
            id: `ql-${label.replace(/\s+/g, '-').toLowerCase()}`,
            label: label,
            icon: 'i-heroicons-arrow-top-right-on-square',
            group: 'Quick Launch',
            action: () => window.open(url, '_blank')
        });
    }

    // -----------------------------------------------------------------------
    // Actions — system-wide operations
    // -----------------------------------------------------------------------
    registerCommand({
        id: 'action-theme-toggle',
        label: 'Toggle Theme',
        icon: 'i-heroicons-sun',
        group: 'Actions',
        action: () => {
            const { toggleTheme } = useIlytatTheme();
            toggleTheme();
        }
    });

    registerCommand({
        id: 'action-theme-light',
        label: 'Switch to Light Theme',
        icon: 'i-heroicons-sun',
        group: 'Actions',
        action: () => {
            const { applyTheme } = useIlytatTheme();
            applyTheme('luxury-platinum');
        }
    });

    registerCommand({
        id: 'action-theme-dark',
        label: 'Switch to Dark Theme',
        icon: 'i-heroicons-moon',
        group: 'Actions',
        action: () => {
            const { applyTheme } = useIlytatTheme();
            applyTheme('luxury-midnight-silk');
        }
    });

    registerCommand({
        id: 'action-theme-favorite',
        label: 'Apply Favorite Theme',
        icon: 'i-heroicons-heart',
        group: 'Actions',
        action: () => {
            const { applyFavorite } = useIlytatTheme();
            applyFavorite();
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

    registerCommand({
        id: 'action-shortcuts',
        label: 'Manage Shortcuts',
        icon: 'i-heroicons-command-line',
        group: 'Actions',
        action: () => router.push('/settings#shortcuts')
    });

    registerCommand({
        id: 'action-refresh',
        label: 'Refresh Page',
        icon: 'i-heroicons-arrow-path',
        shortcut: ['Ctrl', 'Shift', 'R'],
        group: 'Actions',
        action: () => window.location.reload()
    });

    registerCommand({
        id: 'action-fullscreen',
        label: 'Toggle Fullscreen',
        icon: 'i-heroicons-arrows-pointing-out',
        shortcut: ['F11'],
        group: 'Actions',
        action: () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.documentElement.requestFullscreen();
            }
        }
    });

    registerCommand({
        id: 'action-copy-url',
        label: 'Copy Page URL',
        icon: 'i-heroicons-link',
        group: 'Actions',
        action: () => {
            navigator.clipboard.writeText(window.location.href);
        }
    });

    // -----------------------------------------------------------------------
    // View Commands — UI controls
    // -----------------------------------------------------------------------
    registerCommand({
        id: 'view-scroll-top',
        label: 'Scroll to Top',
        icon: 'i-heroicons-arrow-up',
        group: 'View',
        action: () => window.scrollTo({ top: 0, behavior: 'smooth' })
    });

    registerCommand({
        id: 'view-scroll-bottom',
        label: 'Scroll to Bottom',
        icon: 'i-heroicons-arrow-down',
        group: 'View',
        action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    });

    registerCommand({
        id: 'view-go-back',
        label: 'Go Back',
        icon: 'i-heroicons-arrow-left',
        group: 'View',
        action: () => router.back()
    });

    registerCommand({
        id: 'view-go-forward',
        label: 'Go Forward',
        icon: 'i-heroicons-arrow-right',
        group: 'View',
        action: () => router.forward()
    });

    registerCommand({
        id: 'view-clear-console',
        label: 'Clear Console',
        icon: 'i-heroicons-x-circle',
        group: 'View',
        action: () => console.clear()
    });

    // -----------------------------------------------------------------------
    // Dev Tools (conditional)
    // -----------------------------------------------------------------------
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

        registerCommand({
            id: 'dev-test-error',
            label: 'Test Error Toast',
            icon: 'i-heroicons-exclamation-triangle',
            group: 'Development',
            action: () => {
                const { error } = useToast();
                error('Something went wrong!');
            }
        });

        registerCommand({
            id: 'dev-test-warning',
            label: 'Test Warning Toast',
            icon: 'i-heroicons-exclamation-circle',
            group: 'Development',
            action: () => {
                const { warning } = useToast();
                warning('This is a warning!');
            }
        });
    }

    // -----------------------------------------------------------------------
    // Load user-specific shortcut overrides from Firestore (async, non-blocking)
    // Deferred until app:mounted so Firebase / VueFire are guaranteed ready.
    // -----------------------------------------------------------------------
    nuxtApp.hook('app:mounted', async () => {
        try {
            const userStore = useUser();
            const uid = userStore.user.value?.uid;
            if (!uid) return;

            const firestore = useFirestore();
            const { doc, getDoc } = await import('firebase/firestore');
            const snap = await getDoc(doc(firestore, 'users', uid));
            const data = snap.data();

            if (data?.shortcutOverrides && typeof data.shortcutOverrides === 'object') {
                const clean = JSON.parse(JSON.stringify(data.shortcutOverrides));
                loadShortcutOverrides(clean);
            }
        } catch (e) {
            console.warn('[CommandPalette] Could not load shortcut overrides:', e);
        }
    });
});
