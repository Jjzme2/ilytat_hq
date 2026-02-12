import { BaseModel } from './BaseModel';

/**
 * Goal Model
 *
 * Stored as subcollection: `projects/{projectId}/goals/{goalId}`
 * Goals are strategic objectives within a project, created by tenant admins.
 * Tasks are the concrete steps toward achieving a goal (linked via Task.goalId).
 */
export class Goal extends BaseModel {
    title: string;
    description: string;
    targetDate: Date | null;
    status: 'not-started' | 'in-progress' | 'achieved' | 'missed';
    createdBy: string;
    tenantId: string;
    projectId: string;

    constructor(data: any = {}) {
        super(data);
        this.title = data.title || '';
        this.description = data.description || '';
        this.targetDate = data.targetDate ? new Date(data.targetDate) : null;
        this.status = data.status || 'not-started';
        this.createdBy = data.createdBy || '';
        this.tenantId = data.tenantId || '';
        this.projectId = data.projectId || '';
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            title: this.title,
            description: this.description,
            targetDate: this.targetDate,
            status: this.status,
            createdBy: this.createdBy,
            tenantId: this.tenantId,
            projectId: this.projectId
        };
    }
}
