export interface ModuleDefinition {
    id: string
    name: string
    description: string
    icon: string
    route: string
    /** Whether this module can be disabled (core modules cannot) */
    canDisable: boolean
}

export const ALL_MODULES: ModuleDefinition[] = [
    { id: 'projects', name: 'Projects', description: 'Project management and collaboration', icon: '📁', route: '/projects', canDisable: false },
    { id: 'inbox', name: 'Inbox', description: 'Messages and notifications', icon: '📥', route: '/inbox', canDisable: true },
    { id: 'schedule', name: 'Schedule', description: 'Calendar and event management', icon: '📅', route: '/schedule', canDisable: true },
    { id: 'documents', name: 'Documents', description: 'Document creation and templates', icon: '📄', route: '/documents', canDisable: true },
    { id: 'finance', name: 'Finance', description: 'Financial tracking, budgets, and accounts', icon: '💰', route: '/finance', canDisable: true },
    { id: 'themes', name: 'Themes', description: 'Theme gallery and customization', icon: '🎨', route: '/themes', canDisable: true },
    { id: 'pulse', name: 'Pulse', description: 'Activity overview and quick stats', icon: 'activity', route: '/', canDisable: true },
    { id: 'goals', name: 'Goals', description: 'Goal tracking and milestones', icon: '🎯', route: '/goals', canDisable: true },
    { id: 'tasks', name: 'Tasks', description: 'Task management and to-dos', icon: '✅', route: '/tasks', canDisable: true },
];
