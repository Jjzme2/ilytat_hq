import { BaseModel } from './BaseModel';

/**
 * User Model
 *
 * Represents an authenticated user in the system.
 * Maps to the `users` Firestore collection.
 *
 * Users can own personal projects, tasks, and events.
 * Users can be members of an Organization (guild-like startup entity).
 * subscriberTier is set per-user based on their Organization's Stripe plan.
 */
export class User extends BaseModel {
    email: string;
    displayName: string;
    roles: string[];
    bio: string;
    photoURL: string;
    username: string | null;
    uid: string;

    /** Organization (formerly tenantId) this user belongs to */
    organizationId: string | null;

    /** Current subscription tier: 'starter' | 'growth' | 'scale' | null */
    subscriberTier: string | null;
    /** ISO timestamp when the current tier expires (end of billing period) */
    subscriberTierExpiresAt: string | null;

    constructor(data: any = {}) {
        super(data);
        this.email = data.email || '';
        this.displayName = data.displayName || '';
        this.roles = data.roles || [];
        this.bio = data.bio || '';
        this.photoURL = data.photoURL || '';
        this.username = data.username || null;
        this.uid = data.uid || '';
        // Support both old `tenantId` and new `organizationId` for migration
        this.organizationId = data.organizationId || data.tenantId || null;
        this.subscriberTier = data.subscriberTier || null;
        this.subscriberTierExpiresAt = data.subscriberTierExpiresAt || null;
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            email: this.email,
            displayName: this.displayName,
            roles: this.roles,
            bio: this.bio,
            photoURL: this.photoURL,
            username: this.username,
            uid: this.uid,
            organizationId: this.organizationId,
            subscriberTier: this.subscriberTier,
            subscriberTierExpiresAt: this.subscriberTierExpiresAt
        };
    }
}
