import { BaseModel } from './BaseModel';
import { TimeLogSchema, type TimeLogData } from '../schemas/TimeLogSchema';

export class TimeLog extends BaseModel<TimeLogData> {
    userId: string;
    goalId: string | null;
    taskId: string | null;
    projectId: string | null;
    modelType: 'goal' | 'task' | 'project' | 'other';
    startTime: Date;
    endTime: Date | null;
    duration: number;
    description: string;
    isManualEntry: boolean;

    constructor(data: any = {}) {
        const parsed = TimeLogSchema.parse(data);
        super(parsed);
        this.userId = parsed.userId;
        this.goalId = parsed.goalId;
        this.taskId = parsed.taskId;
        this.projectId = parsed.projectId;
        this.modelType = parsed.modelType;
        this.startTime = parsed.startTime;
        this.endTime = parsed.endTime;
        this.duration = parsed.duration;
        this.description = parsed.description;
        this.isManualEntry = parsed.isManualEntry;
    }

    override toJSON(): TimeLogData {
        return {
            ...super.toJSON(),
            id: this.id, // Explicitly include ID
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            userId: this.userId,
            goalId: this.goalId,
            taskId: this.taskId,
            projectId: this.projectId,
            modelType: this.modelType,
            startTime: this.startTime,
            endTime: this.endTime,
            duration: this.duration,
            description: this.description,
            isManualEntry: this.isManualEntry
        };
    }

    get durationHuman() {
        const hours = Math.floor(this.duration / 3600);
        const minutes = Math.floor((this.duration % 3600) / 60);
        const seconds = Math.floor(this.duration % 60);
        return `${hours}h ${minutes}m ${seconds}s`;
    }
}
