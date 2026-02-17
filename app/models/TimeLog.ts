import { BaseModel } from './BaseModel';
import { TimeLogSchema, type TimeLogData } from '../schemas/TimeLogSchema';

export class TimeLog extends BaseModel<TimeLogData> {
    constructor(data: Partial<TimeLogData>) {
        super(TimeLogSchema, data);
    }

    get userId() { return this.data.userId; }
    get tenantId() { return this.data.tenantId; }
    get goalId() { return this.data.goalId; }
    get taskId() { return this.data.taskId; }
    get projectId() { return this.data.projectId; }
    get modelType() { return this.data.modelType; }
    get startTime() { return this.data.startTime; }
    get endTime() { return this.data.endTime; }
    get duration() { return this.data.duration; }
    get description() { return this.data.description; }
    get isManualEntry() { return this.data.isManualEntry; }

    get durationHuman() {
        const hours = Math.floor(this.duration / 3600);
        const minutes = Math.floor((this.duration % 3600) / 60);
        const seconds = Math.floor(this.duration % 60);
        return `${hours}h ${minutes}m ${seconds}s`;
    }
}
