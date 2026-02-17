import { createBaseDocument } from "./base";

export const marketingPlan = {
    name: '🚀 Marketing Campaign Plan',
    type: 'strategy' as const,
    description: 'Launch strategy, channels, and budget for a campaign',
    content: createBaseDocument('MARKETING CAMPAIGN PLAN', `
CAMPAIGN OVERVIEW
Name: {{campaignName}}
Goal: {{campaignGoal}}
Budget: {{budget}}

1. TARGET AUDIENCE
------------------
Primary: {{primaryAudience}}
Secondary: {{secondaryAudience}}

2. KEY MESSAGING & HOOKS
------------------------
Heading: {{headline}}
Value Prop: {{valueProp}}

3. CHANNELS & DISTRIBUTION
--------------------------
[] Social Media: {{socialDetails}}
[] Email: {{emailDetails}}
[] Paid Ads: {{adDetails}}
[] Content/SEO: {{contentDetails}}

4. ASSET CHECKLIST
------------------
- [ ] Copywriting
- [ ] Graphics / Visuals
- [ ] Landing Page
- [ ] Tracking/Analytics Setup

5. TIMELINE
-----------
Launch Date: {{launchDate}}
Milestones:
{{milestones}}
`)
};
