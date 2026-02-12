export interface AdminStat {
    label: string
    value: string | number
    trend?: number
    icon?: string
}

export interface AdminUser {
    uid: string
    email: string
    displayName?: string
    role: string
    lastSignInTime?: string
    disabled: boolean
    forcePasswordReset?: boolean
    tenantId?: string
    employeeId?: number | null
    photoURL?: string
}

export interface AdminProject {
    id: string
    name: string
    description?: string
    status: 'active' | 'on-hold' | 'completed' | 'archived'
    association?: 'personal' | 'company'
    createdAt: any
    members?: string[]
    tenantId?: string
}

export interface SystemServiceStatus {
    name: string
    status: 'online' | 'offline' | 'degraded'
    latency?: string
}

export interface AdminAdapter {
    // Dashboard
    getDashboardStats(): Promise<AdminStat[]>
    getSystemHealth(): Promise<SystemServiceStatus[]>

    // Users
    getUsers(): Promise<AdminUser[]>
    inviteUser(email: string, role: string): Promise<void>
    updateUserStatus(uid: string, disabled: boolean): Promise<void>
    resetUserPassword(uid: string): Promise<string | void> // Returns link if generated, or void if email sent
    assignUserToTenant(uid: string, tenantId: string): Promise<void>
    sendMessage(uid: string, message: string): Promise<void>
    updateUser(uid: string, data: Partial<AdminUser>): Promise<void>

    // Projects
    getProjects(): Promise<AdminProject[]>
    createProject(data: Omit<AdminProject, 'id' | 'createdAt'>): Promise<void>
    updateProject(id: string, data: Partial<AdminProject>): Promise<void>
    deleteProject(id: string): Promise<void>

    // Activity / Audit
    getActivityLogs(limit?: number): Promise<any[]>
}

export const AdminAdapterKey = Symbol('AdminAdapter')
