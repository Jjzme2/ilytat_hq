import { BaseModel } from './BaseModel';
import { InvitationSchema, type InvitationData, InvitationStatus } from '~/schemas/InvitationSchema';

export class Invitation extends BaseModel<InvitationData> {
    fromUserId: string;
    toUserId: string;
    projectId: string;
    projectName?: string;
    status: InvitationStatus;
    role: string;
    message?: string;

    constructor(data: any = {}) {
        const parsed = InvitationSchema.parse(data);
        super(parsed);
        this.fromUserId = parsed.fromUserId;
        this.toUserId = parsed.toUserId;
        this.projectId = parsed.projectId;
        this.projectName = parsed.projectName;
        this.status = parsed.status;
        this.role = parsed.role;
        this.message = parsed.message;
    }

    override toJSON(): InvitationData {
        return {
            ...super.toJSON(),
            id: this.id, // Explicitly include ID if BaseModel doesn't (it usually does in toJSON but strict check)
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            fromUserId: this.fromUserId,
            toUserId: this.toUserId,
            projectId: this.projectId,
            projectName: this.projectName,
            status: this.status,
            role: this.role,
            message: this.message
        };
    }
}
