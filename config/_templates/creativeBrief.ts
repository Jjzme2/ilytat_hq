export const creativeBrief = {
    name: '🎨 Creative Brief',
    type: 'brief' as const,
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
}