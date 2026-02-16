export const invoice = {
    name: '🧾 Invoice',
    type: 'invoice' as const,
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
}