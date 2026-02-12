import { BaseModel } from './BaseModel';

/**
 * Task Model
 *
 * Stored as subcollection: `projects/{projectId}/tasks/{taskId}`
 * Tasks are concrete steps toward achieving a Goal.
 * Created by tenant admins, assignable to any admin/staff within the tenant.
 */
export class Task extends BaseModel {
    title: string;
    description: string;
    isCompleted: boolean;
    status: 'todo' | 'in-progress' | 'done' | 'blocked';
    priority: 'low' | 'medium' | 'high' | 'critical';
    dueDate: Date | null;
    assigneeId: string | null;
    createdBy: string;
    goalId: string | null; // The goal this task is a step toward
    parentTaskId: string | null; // If set, this task is a subtask of the referenced task
    tags: string[];
    tenantId: string;
    projectId: string;

    constructor(data: any = {}) {
        super(data);
        this.title = data.title || '';
        this.description = data.description || '';
        this.isCompleted = data.isCompleted || false;
        this.status = data.status || 'todo';
        this.priority = data.priority || 'medium';
        this.dueDate = data.dueDate ? new Date(data.dueDate) : null;
        this.assigneeId = data.assigneeId || null;
        this.createdBy = data.createdBy || '';
        this.goalId = data.goalId || null;
        this.parentTaskId = data.parentTaskId || null;
        this.tags = Array.isArray(data.tags) ? data.tags : [];
        this.tenantId = data.tenantId || '';
        this.projectId = data.projectId || '';
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            title: this.title,
            description: this.description,
            isCompleted: this.isCompleted,
            status: this.status,
            priority: this.priority,
            dueDate: this.dueDate,
            assigneeId: this.assigneeId,
            createdBy: this.createdBy,
            goalId: this.goalId,
            parentTaskId: this.parentTaskId,
            tags: this.tags,
            tenantId: this.tenantId,
            projectId: this.projectId
        };
    }
}
