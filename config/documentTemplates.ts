/**
 * Document Templates Configuration
 *
 * Pre-built document templates with placeholder variables.
 * Variables use {{variableName}} syntax for insertion.
 *
 * REFACTOR NOTES:
 * - Converted to Class Model for strict typing enforcement.
 * - Used Template Literal Types for dynamic 'other' handling.
 */

// ---------------------------------------------------------------------------
// 1. Imports
// ---------------------------------------------------------------------------
import { projectProposal } from "./_templates/projectProposal";
import { serviceAgreement } from "./_templates/serviceAgreement";
import { invoice } from "./_templates/invoice";
import { creativeBrief } from "./_templates/creativeBrief";
import { stickyNote } from "./_templates/stickyNote";
import { meetingNotes } from "./_templates/meetingNotes";
import { pnl } from "./_templates/pnl";
import { strategicPivot } from "./_templates/strategicPivot";
import { personalProject } from "./_templates/personalProject";
import { projectRetrospective } from "./_templates/projectRetrospective";
import { featureSpec } from "./_templates/featureSpec";
import { marketingPlan } from "./_templates/marketingPlan";
import { subcontractorAgreement } from "./_templates/subcontractorAgreement";

// ---------------------------------------------------------------------------
// 2. Types & Models
// ---------------------------------------------------------------------------

/**
 * Defines the strict category list.
 * Uses a Template Literal Type to allow "other:Your Custom Text".
 */
export type DocumentCategory =
    | 'contract'
    | 'proposal'
    | 'invoice'
    | 'brief'
    | 'template'
    | 'sticky_note'
    | 'report'
    | 'strategy'
    | 'project_plan'
    | `other:${string}`;

export class DocumentTemplateModel {
    name: string;
    type: DocumentCategory;
    description: string;
    content: string | Record<string, any>;
    metadata: {
        priority: string;
        created_at: string;
    };

    constructor(data: {
        name?: string;
        id?: string;
        type: DocumentCategory;
        description?: string;
        content: string | Record<string, any>;
        metadata?: {
            priority?: string;
            created_at?: string;
        };
    }) {
        this.name = data.name || data.id || 'Untitled Template';
        this.type = data.type;
        this.description = data.description || 'No description provided.';
        this.content = data.content;
        this.metadata = {
            priority: data.metadata?.priority || 'medium',
            created_at: data.metadata?.created_at || new Date().toISOString(),
        };
    }
}

// ---------------------------------------------------------------------------
// 3. Configuration
// ---------------------------------------------------------------------------

export const documentTemplates: DocumentTemplateModel[] = [
    new DocumentTemplateModel(serviceAgreement),
    new DocumentTemplateModel(projectProposal),
    new DocumentTemplateModel(invoice),
    new DocumentTemplateModel(creativeBrief),
    new DocumentTemplateModel(stickyNote),
    new DocumentTemplateModel(meetingNotes),
    new DocumentTemplateModel(pnl),
    new DocumentTemplateModel(strategicPivot),
    new DocumentTemplateModel(personalProject),
    new DocumentTemplateModel(projectRetrospective),
    new DocumentTemplateModel(featureSpec),
    new DocumentTemplateModel(marketingPlan),
    new DocumentTemplateModel(subcontractorAgreement),
];