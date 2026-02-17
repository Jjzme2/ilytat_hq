import { createBaseDocument } from "./base";

export const projectRetrospective = {
    name: '🧠 Project Retrospective',
    type: 'report' as const,
    description: 'Post-project analysis of wins, losses, and profitability',
    content: createBaseDocument('PROJECT RETROSPECTIVE', `
PROJECT INFO
Project Name: {{projectName}}
Completion Date: {{completionDate}}
Duration: {{duration}}

1. FINANCIAL OVERVIEW
---------------------
Revenue: {{revenue}}
Expenses: {{expenses}}
Net Profit: {{netProfit}}
Effective Hourly Rate: {{hourlyRate}}

2. WHAT WENT WELL (WINS)
------------------------
- {{win1}}
- {{win2}}
- {{win3}}

3. CHALLENGES & ROADBLOCKS
--------------------------
- {{challenge1}}
- {{challenge2}}

4. LESSONS LEARNED
------------------
{{lessonsLearned}}

5. ACTION ITEMS FOR NEXT TIME
-----------------------------
[ ] {{actionItem1}}
[ ] {{actionItem2}}
`)
};
