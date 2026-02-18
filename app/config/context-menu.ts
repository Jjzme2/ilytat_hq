
export interface ContextMenuAction {
    label: string;
    action: string;
    icon?: string;
    variant?: 'default' | 'danger' | 'warning';
}

export const contextActions: Record<string, ContextMenuAction[]> = {
    'user-card': [
        { label: 'View Profile', action: 'nav:profile', icon: 'i-heroicons-user' },
        { label: 'Message', action: 'modal:chat', icon: 'i-heroicons-chat-bubble-left' }
    ],
    'project-row': [
        { label: 'Open Project', action: 'nav:project', icon: 'i-heroicons-folder-open' },
        { label: 'Edit', action: 'modal:edit-project', icon: 'i-heroicons-pencil' },
        { label: 'Archive', action: 'api:archive', variant: 'danger', icon: 'i-heroicons-archive-box' }
    ],
    'goal-card': [
        { label: 'Edit Goal', action: 'modal:edit-goal', icon: 'i-heroicons-pencil' },
        { label: 'Delete', action: 'api:delete-goal', variant: 'danger', icon: 'i-heroicons-trash' }
    ]
}
