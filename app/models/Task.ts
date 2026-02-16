import { BaseModel } from './BaseModel';
import { TaskSchema, type TaskData } from '~/schemas/TaskSchema';
import { TaskStatus } from '../../config/status';
import { Priority } from '../../config/priority';

/**
 * Task Model
 *
 * Stored as subcollection: `projects/{projectId}/tasks/{taskId}`
 * Tasks are concrete steps toward achieving a Goal.
 * Created by tenant admins, assignable to any admin/staff within the tenant.
 */
export class Task extends BaseModel<TaskData> {
    title: string;
    description: string;
    isCompleted: boolean;
    status: TaskStatus;
    priority: Priority;
    dueDate: Date | null;
    assigneeId: string | null;
    createdBy: string;
    goalId: string | null;
    parentTaskId: string | null;
    tags: string[];
    tenantId: string;
    projectId: string;

    constructor(data: any = {}) {
        const parsed = TaskSchema.parse(data);
        super(parsed);
        this.title = parsed.title;
        this.description = parsed.description;
        this.isCompleted = parsed.isCompleted;
        this.status = parsed.status;
        this.priority = parsed.priority;
        this.dueDate = parsed.dueDate;
        this.assigneeId = parsed.assigneeId;
        this.createdBy = parsed.createdBy;
        this.goalId = parsed.goalId;
        this.parentTaskId = parsed.parentTaskId;
        this.tags = parsed.tags;
        this.tenantId = parsed.tenantId;
        this.projectId = parsed.projectId;
    }

    override toJSON(): TaskData {
        return {
            ...super.toJSON(),
            id: this.id, // Explicitly include ID
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
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

    // View Helpers
    get formattedStatus(): string {
        return this.status.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }

    get statusColor(): string {
        switch (this.status) {
            case TaskStatus.DONE: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case TaskStatus.IN_PROGRESS: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case TaskStatus.BLOCKED: return 'bg-red-500/10 text-red-400 border-red-500/20';
            case TaskStatus.TODO: default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        }
    }

    get priorityColor(): string {
        switch (this.priority) {
            case Priority.CRITICAL: return 'bg-red-500/10 text-red-400 border-red-500/20';
            case Priority.HIGH: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case Priority.MEDIUM: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        }
    }
}


