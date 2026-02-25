export const discountReason = {
    name: '💸 Discount Reason Record',
    type: 'other:discount_reason' as const,
    description: 'Internal record outlining why a discount was created',
    content: `DISCOUNT CREATION RECORD

Discount Name/Code (Encrypted): {{encryptedCode}}
Amount Off: {{amountOff}}
Percent Off (If Applicable): {{percentOff}}
Currency: {{currency}}
Duration: {{duration}}
Duration In Months: {{durationInMonths}}
Max Redemptions: {{maxRedemptions}}

REASON FOR CREATION
-------------------
{{reason}}
`
}
