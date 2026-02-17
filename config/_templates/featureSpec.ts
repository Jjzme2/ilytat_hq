import { createBaseDocument } from "./base";

export const featureSpec = {
    name: '⚙️ Feature Specification',
    type: 'project_plan' as const,
    description: 'Technical and functional requirements for a new feature',
    content: createBaseDocument('FEATURE SPECIFICATION', `
FEATURE OVERVIEW
Name: {{featureName}}
Priority: {{priority}}
Target Release: {{targetRelease}}

1. PROBLEM STATEMENT
--------------------
{{problemStatement}}

2. USER STORIES & GOALS
-----------------------
As a {{userPersona}}, I want to {{action}}, so that {{benefit}}.

3. FUNCTIONAL REQUIREMENTS
--------------------------
- [ ] {{requirement1}}
- [ ] {{requirement2}}
- [ ] {{requirement3}}

4. TECHNICAL IMPLEMENTATION
---------------------------
Frontend:
{{frontendDetails}}

Backend:
{{backendDetails}}

Database Changes:
{{dbChanges}}

5. ACCEPTANCE CRITERIA (definition of done)
-------------------------------------------
- [ ] {{criteria1}}
- [ ] {{criteria2}}
`)
};
