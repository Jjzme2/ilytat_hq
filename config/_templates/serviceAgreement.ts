export const serviceAgreement = {
    name: '📄 Service Contract',
    type: 'contract' as const,
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
}