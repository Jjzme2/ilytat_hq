/**
 * Document Templates Configuration
 *
 * Pre-built document templates with placeholder variables.
 * Variables use {{variableName}} syntax for insertion.
 * These can be used when creating new documents in the Foundry.
 */

export interface DocumentTemplate {
    name: string
    type: 'contract' | 'proposal' | 'invoice' | 'brief' | 'template' | 'other'
    description: string
    content: string
}

export const documentTemplates: DocumentTemplate[] = [
    {
        name: '📄 Service Contract',
        type: 'contract',
        description: 'Standard service agreement between parties',
        content: `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of {{date}} by and between:

Provider: {{providerName}}
Client: {{clientName}}

1. SCOPE OF SERVICES
{{scopeDescription}}

2. COMPENSATION
Total Fee: {{totalFee}}
Payment Schedule: {{paymentSchedule}}

3. TIMELINE
Start Date: {{startDate}}
Estimated Completion: {{endDate}}

4. TERMS & CONDITIONS
This agreement is governed by standard terms. Both parties agree to the deliverables outlined above.

Signed,
_________________________
{{providerName}}

_________________________
{{clientName}}`
    },
    {
        name: '💡 Project Proposal',
        type: 'proposal',
        description: 'Client-facing project proposal with scope and pricing',
        content: `PROJECT PROPOSAL

Prepared for: {{clientName}}
Prepared by: {{providerName}}
Date: {{date}}

EXECUTIVE SUMMARY
{{executiveSummary}}

PROJECT OBJECTIVES
{{objectives}}

SCOPE OF WORK
{{scopeOfWork}}

DELIVERABLES
{{deliverables}}

TIMELINE
{{timeline}}

INVESTMENT
{{pricing}}

NEXT STEPS
To proceed, please sign and return this proposal by {{deadline}}.`
    },
    {
        name: '🧾 Invoice',
        type: 'invoice',
        description: 'Standard billing invoice',
        content: `INVOICE

Invoice #: {{invoiceNumber}}
Date: {{date}}
Due Date: {{dueDate}}

FROM:
{{providerName}}
{{providerAddress}}

TO:
{{clientName}}
{{clientAddress}}

ITEMS:
{{lineItems}}

Subtotal: {{subtotal}}
Tax: {{tax}}
TOTAL DUE: {{total}}

Payment Terms: {{paymentTerms}}`
    },
    {
        name: '🎨 Creative Brief',
        type: 'brief',
        description: 'Design or creative project brief',
        content: `CREATIVE BRIEF

Project: {{projectName}}
Date: {{date}}
Prepared by: {{preparedBy}}

1. BACKGROUND
{{background}}

2. OBJECTIVES
{{objectives}}

3. TARGET AUDIENCE
{{targetAudience}}

4. KEY MESSAGE
{{keyMessage}}

5. TONE & STYLE
{{toneAndStyle}}

6. DELIVERABLES
{{deliverables}}

7. TIMELINE & BUDGET
Timeline: {{timeline}}
Budget: {{budget}}`
    },
    {
        name: '📝 Meeting Notes',
        type: 'other',
        description: 'Structured meeting notes template',
        content: `MEETING NOTES

Date: {{date}}
Attendees: {{attendees}}
Subject: {{subject}}

AGENDA
{{agenda}}

DISCUSSION POINTS
{{discussionPoints}}

ACTION ITEMS
{{actionItems}}

NEXT MEETING
Date: {{nextMeetingDate}}
Topics: {{nextTopics}}`
    }
]
