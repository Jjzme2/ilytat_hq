import { createBaseDocument } from "./base";

export const subcontractorAgreement = {
    name: '🤝 Subcontractor Agreement',
    type: 'contract' as const,
    description: 'Agreement for external freelancers/contractors',
    content: createBaseDocument('SUBCONTRACTOR AGREEMENT', `
PARTIES
-------
Company: {{companyName}} (ILYTAT LLC)
Contractor: {{contractorName}}
Effective Date: {{date}}

1. SCOPE OF WORK
----------------
The Contractor agrees to perform the following services:
{{scopeOfWork}}

2. COMPENSATION
---------------
Rate: {{rate}}
Max Hours/Budget: {{maxLimit}}
Payment Terms: {{paymentTerms}} (e.g., Net 15 upon invoice)

3. INTELLECTUAL PROPERTY
------------------------
"Work Made for Hire": All work results, code, designs, and inventions created under this agreement shall be the sole property of the Company.

4. CONFIDENTIALITY
------------------
Contractor agrees not to disclose any proprietary information, trade secrets, or client details to third parties.

5. TERMINATION
--------------
Either party may terminate this agreement with {{noticePeriod}} days written notice.

ACCEPTED AND AGREED:

________________________      ________________________
Company Representative        Contractor
Date:                         Date:
`)
};
