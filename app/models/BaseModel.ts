export interface BaseModelData {
    id?: string;
    createdAt?: Date | { seconds: number; nanoseconds: number } | string | null;
    updatedAt?: Date | { seconds: number; nanoseconds: number } | string | null;
}

export abstract class BaseModel<T extends BaseModelData = any> {
    id: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: T) {

        this.id = data.id || '';
        this.createdAt = this.parseDate(data.createdAt);
        this.updatedAt = this.parseDate(data.updatedAt);
    }

    private parseDate(date: any): Date {
        if (!date) return new Date();
        if (date instanceof Date) return date;
        if (typeof date === 'object' && 'seconds' in date) return new Date(date.seconds * 1000);
        if (typeof date === 'string') return new Date(date);
        return new Date();
    }

    toJSON(): BaseModelData {
        return {
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

