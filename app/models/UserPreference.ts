import { BaseModel } from './BaseModel';

export class UserPreference extends BaseModel {
    theme: string;
    notifications: boolean;
    dashboardLayout: any;

    constructor(data: any = {}) {
        super(data);
        this.theme = data.theme || 'system';
        this.notifications = data.notifications !== undefined ? data.notifications : true;
        this.dashboardLayout = data.dashboardLayout || {};
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
