import { BaseModel } from './BaseModel';
import { ALL_MODULES } from '../config/modules';

export interface DashboardWidget {
    id: string;
    enabled: boolean;
    order: number;
    settings?: Record<string, any>;
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
        // Default layout
        if (data.dashboardLayout) {
            this.dashboardLayout = data.dashboardLayout;
        } else {
            // Generate default layout from ALL_MODULES
            // We can use a partial default list for specific ordering/enabling, or just map all
            const defaultEnabled = ['pulse', 'schedule', 'inbox', 'tasks', 'projects', 'theme'];

            // Import dynamically to avoid potential cyclic issues if any, or just import at top if safe.
            // Since this is a model, importing config is safe.
            // Note: recursive import of ALL_MODULES might be an issue if config imports something that imports this model.
            // config/modules.ts -> (no imports). Safe.

            this.dashboardLayout = ALL_MODULES.map((m, index) => ({
                id: m.id,
                enabled: defaultEnabled.includes(m.id),
                order: index
            }));
        }
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
