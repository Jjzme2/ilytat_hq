export enum Priority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export const isValidPriority = (priority: string): priority is Priority => {
    return Object.values(Priority).includes(priority as Priority);
};
