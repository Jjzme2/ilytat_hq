export const projectProposal = {
    name: '💡 Project Proposal',
    type: 'proposal' as const,
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
}