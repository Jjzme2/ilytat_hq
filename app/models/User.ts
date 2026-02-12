import { BaseModel } from './BaseModel';

export class User extends BaseModel {
    email: string;
    displayName: string;
    roles: string[];
    tenantId: string | null;
    bio: string;
    photoURL: string;
    employeeId: number | null;
    uid: string;
    activeThemeId: string;
    savedThemeIds: string[];

    constructor(data: any = {}) {
        super(data);
        this.email = data.email || '';
        this.displayName = data.displayName || '';
        this.roles = data.roles || [];
        this.tenantId = data.tenantId || null;
        this.bio = data.bio || '';
        this.photoURL = data.photoURL || '';
        this.employeeId = data.employeeId || null;
        this.uid = data.uid || '';
        this.activeThemeId = data.activeThemeId || 'light-default';
        this.savedThemeIds = data.savedThemeIds || ['light-default', 'dark-default'];
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            email: this.email,
            displayName: this.displayName,
            roles: this.roles,
            tenantId: this.tenantId,
            bio: this.bio,
            photoURL: this.photoURL,
            employeeId: this.employeeId,
            uid: this.uid,
            activeThemeId: this.activeThemeId,
            savedThemeIds: this.savedThemeIds
        };
    }
}
