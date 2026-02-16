export const personalProject = {
    name: '🌱 Personal Project Canvas',
    type: 'project_plan' as const,
    description: 'A project framework focusing on non-monetary profit and personal growth',
    content: `PERSONAL PROJECT CANVAS
Project Name: {{projectName}}
Date: {{date}}

1. THE "WHY" (NON-MONETARY PROFIT)
Beyond money, what does this project profit me? (Joy, learning, network, mastery?)
{{profitDescription}}

2. SUCCESS DEFINITION
This project is a success if... (Define "Done" and "Win")
{{successDefinition}}

3. ANTI-GOALS
What will I NOT do? (Burnout, detailed specs, boring tasks, etc.)
{{antiGoals}}

4. RESOURCES & CONSTRAINTS
Time Budget: {{timeBudget}}
Financial Budget: {{financialBudget}}
Energy Level Required: {{energyLevel}}

5. THE FIRST SPRINT
What can be shipped/finished in the first 7 days?
{{firstSprintGoal}}`
}
