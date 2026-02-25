export interface ModuleDefinition {
    id: string
    name: string
    description: string
    icon: string
    route: string
    /** Whether this module can be disabled (core modules cannot) */
    canDisable: boolean
    /** Minimum plan required to access this module. Undefined = always available. */
    requiredPlan?: 'starter' | 'growth' | 'scale'
}

export const ALL_MODULES: ModuleDefinition[] = [
    // Starter tier — core modules available to all paying users
    { id: 'projects', name: 'Projects', description: 'Project management and collaboration', icon: '📁', route: '/projects', canDisable: false, requiredPlan: 'starter' },
    { id: 'goals', name: 'Goals', description: 'Goal tracking and milestones', icon: '🎯', route: '/goals', canDisable: true, requiredPlan: 'starter' },
    { id: 'tasks', name: 'Tasks', description: 'Task management and to-dos', icon: '✅', route: '/tasks', canDisable: true, requiredPlan: 'starter' },
    { id: 'documents', name: 'Documents', description: 'Document creation and templates', icon: '📄', route: '/documents', canDisable: true, requiredPlan: 'starter' },
    { id: 'pulse', name: 'Pulse', description: 'Activity overview and quick stats', icon: 'activity', route: '/', canDisable: true, requiredPlan: 'starter' },

    // Growth tier — business tools
    { id: 'finance', name: 'Finance', description: 'Financial tracking, budgets, and accounts', icon: '💰', route: '/finance', canDisable: true, requiredPlan: 'growth' },
    { id: 'ai', name: 'AI', description: 'AI usage tracking and model preferences', icon: '🤖', route: '/ai', canDisable: true, requiredPlan: 'growth' },
    { id: 'inbox', name: 'Inbox', description: 'Messages and notifications', icon: '📥', route: '/inbox', canDisable: true, requiredPlan: 'growth' },
    { id: 'schedule', name: 'Schedule', description: 'Calendar and event management', icon: '📅', route: '/schedule', canDisable: true, requiredPlan: 'growth' },

    // Scale tier — premium features
    { id: 'theme', name: 'Themes', description: 'Theme gallery and customization', icon: '🎨', route: '/themes', canDisable: true, requiredPlan: 'scale' },
];

/** Plan tier ordering for comparison (higher index = higher tier) */
export const PLAN_TIERS = ['starter', 'growth', 'scale'] as const

/** Check if userPlan meets or exceeds the requiredPlan */
export const isPlanSufficient = (userPlan: string, requiredPlan: string): boolean => {
    const userIndex = PLAN_TIERS.indexOf(userPlan as any)
    const requiredIndex = PLAN_TIERS.indexOf(requiredPlan as any)
    // If plan not found, deny access (except 'free' which has no access)
    if (userIndex === -1) return false
    return userIndex >= requiredIndex
}
