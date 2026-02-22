import { BaseModel } from './BaseModel';
import { UserInsightSchema, type UserInsightData } from '../schemas/UserInsightSchema';

export class UserInsight extends BaseModel<UserInsightData> {
    userId: string;
    tenantId: string;
    summary: string;
    focusAreas: string[];
    productivityScore: number;
    persona: string;
    lastAnalyzed: Date | null;

    constructor(data: any = {}) {
        const parsed = UserInsightSchema.parse(data);
        super(parsed);
        this.userId = parsed.userId;
        this.tenantId = parsed.tenantId;
        this.summary = parsed.summary;
        this.focusAreas = parsed.focusAreas;
        this.productivityScore = parsed.productivityScore;
        this.persona = parsed.persona;
        this.lastAnalyzed = null;
        if (parsed.lastAnalyzed) {
            if (typeof parsed.lastAnalyzed.toDate === 'function') {
                this.lastAnalyzed = parsed.lastAnalyzed.toDate();
            } else if (parsed.lastAnalyzed instanceof Date) {
                this.lastAnalyzed = parsed.lastAnalyzed;
            } else if (typeof parsed.lastAnalyzed === 'string' || typeof parsed.lastAnalyzed === 'number') {
                const d = new Date(parsed.lastAnalyzed);
                if (!isNaN(d.getTime())) {
                    this.lastAnalyzed = d;
                }
            }
            // If it's a Firestore FieldValue or unknown object, we leave it as null locally
            // as it will be populated by the server on subsequent fetch.
        }
    }

    override toJSON(): UserInsightData {
        return {
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            userId: this.userId,
            tenantId: this.tenantId,
            summary: this.summary,
            focusAreas: this.focusAreas,
            productivityScore: this.productivityScore,
            persona: this.persona,
            lastAnalyzed: this.lastAnalyzed
        };
    }
}
