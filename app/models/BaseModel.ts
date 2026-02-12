export class BaseModel {
    id: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: any = {}) {
        this.id = data.id || '';
        this.createdAt = data.createdAt ? new Date(data.createdAt.seconds ? data.createdAt.seconds * 1000 : data.createdAt) : new Date();
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt.seconds ? data.updatedAt.seconds * 1000 : data.updatedAt) : new Date();
    }

    toJSON() {
        return {
            ...this,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
