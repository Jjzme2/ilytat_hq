import { BaseModel } from './BaseModel';
import { ProjectSchema, type ProjectData } from '~/schemas/ProjectSchema';
import { ProjectStatus } from '../../config/status';
import { Priority } from '../../config/priority';

/**
 * Project Model
 *
 * Subcollection: `tenants/{tenantId}/projects/{projectId}`
 * Each project belongs to exactly one tenant.
 * Contains subcollections for tasks and goals.
 */
export class Project extends BaseModel<ProjectData> {
    name: string;
    description: string;
    status: ProjectStatus;
    association: 'personal' | 'company';
    priority: Priority;
    tenantId: string;
    createdBy: string;
    ownerId: string;
    roles: Record<string, string>;
    startDate: Date | null;
    deadline: Date | null;
    tags: string[];
    progress: number; // 0-100
    purpose: string;
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
        // Fallback: If ownerId is missing but createdBy exists, assume creator is owner
        this.ownerId = parsed.ownerId || parsed.createdBy;
        this.roles = parsed.roles;
        this.startDate = parsed.startDate;
        this.deadline = parsed.deadline;
        this.tags = parsed.tags;
        this.progress = parsed.progress;
        this.purpose = parsed.purpose;
        this.quickLaunch = parsed.quickLaunch as Record<string, string>;
        this.members = parsed.members;
    }

    override toJSON(): ProjectData {
        return {
            ...super.toJSON(),
            id: this.id, // Explicitly include ID
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            name: this.name,
            description: this.description,
            status: this.status,
            association: this.association,
            priority: this.priority,
            tenantId: this.tenantId,
            createdBy: this.createdBy,
            ownerId: this.ownerId,
            roles: this.roles,
            startDate: this.startDate,
            deadline: this.deadline,
            tags: this.tags,
            progress: this.progress,
            purpose: this.purpose,
            quickLaunch: this.quickLaunch as Record<string, string>,
            members: this.members
        };
    }



    // View Helpers
    get formattedStatus(): string {
        return this.status.charAt(0).toUpperCase() + this.status.slice(1).replace('_', ' ');
    }

    get statusColor(): string {
        switch (this.status) {
            case ProjectStatus.ACTIVE: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case ProjectStatus.PENDING: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case ProjectStatus.COMPLETED: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case ProjectStatus.ARCHIVED: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
            case ProjectStatus.HOLD: return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        }
    }

    get priorityColor(): string {
        switch (this.priority) {
            case Priority.HIGH: return 'text-amber-400';
            case Priority.CRITICAL: return 'text-red-400 font-bold';
            case Priority.MEDIUM: return 'text-blue-400';
            default: return 'text-zinc-400';
        }
    }
}

