export enum ProjectStatus {
    ACTIVE = 'active',
    ARCHIVED = 'archived',
    PENDING = 'pending',
    HOLD = 'hold',
    COMPLETED = 'completed'
}

export enum GoalStatus {
    NOT_STARTED = 'not-started',
    IN_PROGRESS = 'in-progress',
    ACHIEVED = 'achieved',
    MISSED = 'missed'
}

export enum TaskStatus {
    TODO = 'todo',
    IN_PROGRESS = 'in-progress',
    DONE = 'done',
    BLOCKED = 'blocked'
}

export const isValidTaskStatus = (status: string): status is TaskStatus => {
    return Object.values(TaskStatus).includes(status as TaskStatus);
};

