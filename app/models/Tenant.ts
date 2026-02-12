import { BaseModel } from './BaseModel';

/**
 * Tenant (Company) Model
 *
 * Represents an organization in the multi-tenant system.
 * Maps to the `tenants` Firestore collection.
 * A tenant owns multiple projects and has members (users with matching tenantId).
 */
export class Tenant extends BaseModel {
    name: string;
    domain: string;
    logo: string;
    plan: 'free' | 'pro' | 'enterprise';
    memberIds: string[];
    quickLaunch: Record<string, string>;

    // Subcollections:
    // - projects: Collection<Project>
    // - members: Collection<TenantMember>

    constructor(data: any = {}) {
        super(data);
        this.name = data.name || '';
        this.domain = data.domain || '';
        this.logo = data.logo || '';
        this.plan = data.plan || 'free';
        this.memberIds = Array.isArray(data.memberIds) ? data.memberIds : [];
        this.quickLaunch = data.quickLaunch || {};
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            name: this.name,
            domain: this.domain,
            logo: this.logo,
            plan: this.plan,
            memberIds: this.memberIds,
            quickLaunch: this.quickLaunch
        };
    }
}
