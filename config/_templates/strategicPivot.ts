export const strategicPivot = {
    name: '🔄 Strategic Pivot Framework',
    type: 'strategy' as const,
    description: 'Framework for evaluating and executing a strategic change direction',
    content: `STRATEGIC PIVOT FRAMEWORK
Date: {{date}}
Project/Company: {{entityName}}

1. THE TRIGGER
Why are we considering a pivot now? (Market change, feedback, tech shift?)
{{triggerReason}}

2. THE NEW HYPOTHESIS
What is the new direction and why do we believe it will succeed?
{{newHypothesis}}

3. RETAIN vs. DISCARD
What assets/features do we keep?
{{assetsToKeep}}

What do we stop doing immediately?
{{assetsToDiscard}}

4. SUCCESS METRICS (KPIs)
How will we know the pivot is working in 30/60/90 days?
{{successMetrics}}

5. EXECUTION PLAN
Key Milestones:
{{milestones}}`
}
