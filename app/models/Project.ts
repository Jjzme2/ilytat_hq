import { BaseModel } from './BaseModel';
import { ProjectSchema } from '~/schemas/ProjectSchema';

/**
 * Project Model
 *
 * Subcollection: `tenants/{tenantId}/projects/{projectId}`
 * Each project belongs to exactly one tenant.
 * Contains subcollections for tasks and goals.
 */
export class Project extends BaseModel {
    name: string;
    description: string;
    status: 'active' | 'archived' | 'pending' | 'hold' | 'completed';
    association: 'personal' | 'company';
    priority: 'low' | 'medium' | 'high' | 'critical';
    tenantId: string;
    createdBy: string;
    startDate: Date | null;
    deadline: Date | null;
    tags: string[];
    progress: number; // 0-100
    quickLaunch: Record<string, string>;
    members: string[];

    constructor(data: any = {}) {
        const parsed = ProjectSchema.parse(data);
        super(parsed);
        this.name = parsed.name;
        this.description = parsed.description;
        this.status = parsed.status;
        this.association = parsed.association;
        this.priority = parsed.priority;
        this.tenantId = parsed.tenantId;
        this.createdBy = parsed.createdBy;
        this.startDate = parsed.startDate;
        this.deadline = parsed.deadline;
        this.tags = parsed.tags;
        this.progress = parsed.progress;
        this.quickLaunch = parsed.quickLaunch;
        this.members = parsed.members;
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            name: this.name,
            description: this.description,
            status: this.status,
            association: this.association,
            priority: this.priority,
            tenantId: this.tenantId,
            createdBy: this.createdBy,
            startDate: this.startDate,
            deadline: this.deadline,
            tags: this.tags,
            progress: this.progress,
            quickLaunch: this.quickLaunch,
            members: this.members
        };
    }
}
