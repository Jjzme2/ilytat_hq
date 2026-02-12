export interface ActivityItem {
    id: string
    action: string
    module: string
    userId: string
    timestamp: any
    metadata?: Record<string, any>
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string | null;
    roles?: ('admin' | 'member' | 'viewer')[];
    tenantId?: string;
    createdAt: any;
}

export interface TaskGroup {
    id: string
    name: string
    description: string
    tasks?: any[]
    updatedAt: any
}

export interface TaskCategory {
    id: string
    label: string
    emoji: string
    color: string
}
