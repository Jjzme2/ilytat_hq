import { BaseModel } from './BaseModel';
import { GoalSchema, type GoalData } from '~/schemas/GoalSchema';
import { GoalStatus } from '../../config/status';

/**
 * Goal Model
 *
 * Stored as subcollection: `projects/{projectId}/goals/{goalId}`
 * Goals are strategic objectives within a project, created by tenant admins.
 * Tasks are the concrete steps toward achieving a goal (linked via Task.goalId).
 */
export class Goal extends BaseModel<GoalData> {
    title: string;
    description: string;
    targetDate: Date | null;
    status: GoalStatus;
    createdBy: string;
    tenantId: string;
    projectId: string;

    constructor(data: any = {}) {
        const parsed = GoalSchema.parse(data);
        super(parsed);
        this.title = parsed.title;
        this.description = parsed.description;
        this.targetDate = parsed.targetDate;
        this.status = parsed.status;
        this.createdBy = parsed.createdBy;
        this.tenantId = parsed.tenantId;
        this.projectId = parsed.projectId;
    }

    override toJSON(): GoalData {
        return {
            ...super.toJSON(),
            id: this.id, // Explicitly include ID
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            title: this.title,
            description: this.description,
            targetDate: this.targetDate,
            status: this.status,
            createdBy: this.createdBy,
            tenantId: this.tenantId,
            projectId: this.projectId
        };
    }

    // View Helpers
    get formattedStatus(): string {
        return this.status.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }

    get statusColor(): string {
        switch (this.status) {
            case GoalStatus.ACHIEVED: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case GoalStatus.IN_PROGRESS: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case GoalStatus.MISSED: return 'bg-red-500/10 text-red-400 border-red-500/20';
            case GoalStatus.NOT_STARTED: default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        }
    }
}
