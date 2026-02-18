export const AI_PROMPTS = {
    // Finance
    finance: {
        analyzeProfitability: `Analyze the profitability of the following financial data. 
        Provide a summary of income vs expenses, identify key cost drivers, and suggest 3 actionable ways to improve the margin.
        Format the response in Markdown with clear headings and bullet points.
        
        Data:
        {{context}}`,

        plan: `Based on the following financial snapshot, create a practical 90-day financial plan.
        Include:
        1. **Immediate Actions** (Week 1-2): Quick wins to improve cash position
        2. **Short-term Goals** (Month 1): Revenue targets and cost reductions
        3. **Mid-term Strategy** (Month 2-3): Growth initiatives and investment priorities
        4. **Risk Mitigation**: Top 3 financial risks and contingency plans
        5. **KPI Targets**: Specific metrics to track progress
        
        Keep recommendations actionable and specific to the numbers provided.
        Format in Markdown with clear headings.
        
        Financial Data:
        {{context}}`
    },

    // Documents
    documents: {
        refine: `Refine the following text to be more professional, clear, and concise. 
        Maintain the original meaning but improve the flow and vocabulary.
        
        Text:
        {{context}}`,

        fixGrammar: `Correct any grammar, spelling, or punctuation errors in the following text. 
        Do not change the style or tone, just fix errors.
        
        Text:
        {{context}}`,

        expand: `Expand upon the following text, adding more detail, examples, or context where appropriate. 
        Keep the tone consistent with the original.
        
        Text:
        {{context}}`
    },

    // Projects
    projects: {
        suggestTasks: `Based on the following project description and goals, suggest 5-10 actionable tasks to help complete the project.
        Organize them by phase if possible.
        
        Project Name: {{projectName}}
        Description: {{description}}
        Goals: {{goals}}
        
        Format as a JSON array of objects with 'title' and 'priority' (Low, Medium, High) keys.`
    }
};
