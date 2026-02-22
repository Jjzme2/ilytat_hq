

import { useCommandPalette } from '#imports'
import { quicklaunch } from '../../config/quicklaunch'

export default defineNuxtPlugin((nuxtApp) => {
    const { registerCommand, open, toggle, loadShortcutOverrides } = useCommandPalette();
    const router = useRouter();

    // -----------------------------------------------------------------------
    // Navigation — Core destinations
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
        id: 'nav-foundry',
        label: 'AI Foundry',
        icon: 'i-heroicons-sparkles',
        shortcut: ['Ctrl', '7'],
        group: 'Intelligence',
        action: () => router.push('/foundry')
    });

    registerCommand({
        id: 'nav-user-insights',
        label: 'Digital Identity Insights',
        icon: 'i-heroicons-user-circle',
        group: 'Intelligence',
        action: () => router.push('/user-insight')
    });

    registerCommand({
        id: 'nav-admin',
        label: 'Admin Panel',
        icon: 'i-heroicons-shield-check',
        group: 'System',
        action: () => router.push('/admin')
    });

    registerCommand({
        id: 'nav-settings',
        label: 'Settings',
        icon: 'i-heroicons-adjustments-horizontal',
        shortcut: ['Ctrl', ','],
        group: 'System',
        action: () => router.push('/settings')
    });

    registerCommand({
        id: 'nav-themes',
        label: 'Theme Gallery',
        icon: 'i-heroicons-swatch',
        group: 'System',
        action: () => router.push('/themes')
    });

    // -----------------------------------------------------------------------
    // Creation — Fast-entry workflows
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

    registerCommand({
        id: 'voice-dictate',
        label: 'Start Voice Dictation',
        icon: 'i-heroicons-microphone',
        shortcut: ['Ctrl', 'Shift', 'V'],
        group: 'Quick Capture',
        action: () => router.push('/schedule?action=voice')
    });

    // -----------------------------------------------------------------------
    // Intelligence — AI & Insights
    // -----------------------------------------------------------------------
    registerCommand({
        id: 'assistant-toggle',
        label: 'Toggle AI Assistant',
        icon: 'i-heroicons-chat-bubble-left-right',
        shortcut: ['Ctrl', 'Alt', 'A'],
        group: 'Intelligence',
        action: () => {
            // This assumes a global state or event bus for the assistant
            // For now we use window event as a bridge to ChatAssistantBar.vue
            window.dispatchEvent(new CustomEvent('ilytat:assistant:toggle'));
        }
    });

    registerCommand({
        id: 'assistant-minimize',
        label: 'Minimize Assistant',
        icon: 'i-heroicons-chevron-down',
        group: 'Intelligence',
        action: () => {
            window.dispatchEvent(new CustomEvent('ilytat:assistant:minimize'));
        }
    });

    registerCommand({
        id: 'assistant-clear',
        label: 'Clear Chat History',
        icon: 'i-heroicons-trash',
        group: 'Intelligence',
        action: () => {
            window.dispatchEvent(new CustomEvent('ilytat:assistant:clear'));
        }
    });

    // -----------------------------------------------------------------------
    // Finance — Operations
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
        id: 'finance-overview',
        label: 'Financial Overview',
        icon: 'i-heroicons-presentation-chart-bar',
        group: 'Finance',
        action: () => router.push('/finance')
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
    // System — Platform controls
    // -----------------------------------------------------------------------
    registerCommand({
        id: 'action-theme-toggle',
        label: 'Toggle Theme',
        icon: 'i-heroicons-sun',
        group: 'System',
        action: () => {
            const { toggleTheme } = useIlytatTheme();
            toggleTheme();
        }
    });

    registerCommand({
        id: 'action-theme-favorite',
        label: 'Apply Favorite Theme',
        icon: 'i-heroicons-heart',
        shortcut: ['Ctrl', 'Alt', 'F'],
        group: 'System',
        action: () => {
            const { applyFavorite } = useIlytatTheme();
            applyFavorite();
        }
    });

    registerCommand({
        id: 'action-logout',
        label: 'Sign Out',
        icon: 'i-heroicons-arrow-left-on-rectangle',
        group: 'System',
        action: () => {
            const { signOut } = useUser();
            signOut();
        }
    });

    registerCommand({
        id: 'action-shortcuts',
        label: 'Manage Shortcuts',
        icon: 'i-heroicons-command-line',
        group: 'System',
        action: () => router.push('/settings#shortcuts')
    });

    registerCommand({
        id: 'action-refresh',
        label: 'Refresh Page',
        icon: 'i-heroicons-arrow-path',
        shortcut: ['Ctrl', 'Shift', 'R'],
        group: 'System',
        action: () => window.location.reload()
    });

    registerCommand({
        id: 'action-fullscreen',
        label: 'Toggle Fullscreen',
        icon: 'i-heroicons-arrows-pointing-out',
        shortcut: ['F11'],
        group: 'System',
        action: () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.documentElement.requestFullscreen();
            }
        }
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
    }

    // -----------------------------------------------------------------------
    // Load user-specific shortcut overrides from Firestore (async, non-blocking)
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
