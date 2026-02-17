import { BaseModel } from './BaseModel';

export interface DashboardWidget {
    id: string;
    enabled: boolean;
    order: number;
}

export class UserPreference extends BaseModel {
    theme: string;
    notifications: boolean;
    dashboardLayout: DashboardWidget[];

    constructor(data: any = {}) {
        super(data);
        this.theme = data.theme || 'system';
        this.notifications = data.notifications !== undefined ? data.notifications : true;
        // Default layout
        this.dashboardLayout = data.dashboardLayout || [
            { id: 'pulse', enabled: true, order: 0 },
            { id: 'schedule', enabled: true, order: 1 },
            { id: 'inbox', enabled: true, order: 2 },
            { id: 'tasks', enabled: true, order: 3 },
            { id: 'projects', enabled: true, order: 4 },
            { id: 'goals', enabled: false, order: 5 },
            { id: 'finance', enabled: false, order: 6 },
            { id: 'theme', enabled: true, order: 7 }
        ];
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            theme: this.theme,
            notifications: this.notifications,
            dashboardLayout: this.dashboardLayout
        };
    }
}
