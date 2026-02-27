import { BaseModel } from './BaseModel';

/**
 * Organization Model (formerly Tenant)
 *
 * Represents a guild-like startup entity in the system.
 * Maps to the `tenants` Firestore collection (kept for data continuity).
 *
 * Organizations own shared resources and have members (users).
 * Think of it as a "guild" — a group working on a startup together.
 * Stripe billing is tied to the Organization, not individual users.
 */
export class Organization extends BaseModel {
    name: string;
    domain: string;
    logo: string;
    filesUrl: string;
    plan: 'free' | 'pro' | 'enterprise';
    memberIds: string[];
    quickLaunch: Record<string, string>;

    missionStatement: string;
    pillars: string[];
    coreValues: string[];

    createdBy: string;

    /** Optional local project directory path (e.g. ~/Projects/my-startup) */
    directoryPath: string;
    /** Optional associated PC/device name (e.g. JJ-Desktop) */
    machineName: string;

    // Stripe subscription fields
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'trialing' | 'none';
    maxMembers: number;

    constructor(data: any = {}) {
        super(data);
        this.name = data.name || '';
        this.domain = data.domain || '';
        this.logo = data.logo || '';
        this.filesUrl = data.filesUrl || '';
        this.plan = data.plan || 'free';
        this.memberIds = Array.isArray(data.memberIds) ? data.memberIds : [];
        this.quickLaunch = data.quickLaunch || {};
        this.missionStatement = data.missionStatement || '';
        this.pillars = Array.isArray(data.pillars) ? data.pillars : [];
        this.coreValues = Array.isArray(data.coreValues) ? data.coreValues : [];
        this.createdBy = data.createdBy || '';
        this.directoryPath = data.directoryPath || '';
        this.machineName = data.machineName || '';
        this.stripeCustomerId = data.stripeCustomerId || '';
        this.stripeSubscriptionId = data.stripeSubscriptionId || '';
        this.subscriptionStatus = data.subscriptionStatus || 'none';
        this.maxMembers = data.maxMembers || 2;
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            name: this.name,
            domain: this.domain,
            logo: this.logo,
            plan: this.plan,
            memberIds: this.memberIds,
            quickLaunch: this.quickLaunch,
            missionStatement: this.missionStatement,
            pillars: this.pillars,
            coreValues: this.coreValues,
            filesUrl: this.filesUrl,
            createdBy: this.createdBy,
            directoryPath: this.directoryPath,
            machineName: this.machineName,
            stripeCustomerId: this.stripeCustomerId,
            stripeSubscriptionId: this.stripeSubscriptionId,
            subscriptionStatus: this.subscriptionStatus,
            maxMembers: this.maxMembers
        };
    }
}
