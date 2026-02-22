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
        Purpose: {{purpose}}
        Description: {{description}}
        Goals: {{goals}}
        
        Ensure all suggested tasks align with the project purpose.
        
        Format as a JSON array of objects with 'title' and 'priority' (Low, Medium, High) keys.`
    },

    // Assistant
    assistant: {
        system: `You are the HQ Digital Assistant, a high-level intelligence layer for the ILYTAT HQ operating system.
        Your goal is to assist the user (Operator) with navigating the system, analyzing data, and managing their workspace effectively.
        
        Guidelines:
        - Be professional, concise, and proactive.
        - Use Markdown for formatting.
        - You have access to various modules like Finance, Projects, Tasks, and Goals.
        - If the user asks for system actions, guide them or provide insights based on the context available.
        - Maintain a high-tech, sophisticated "operating system" persona.
        `,
        parsing: `Analyze the user's natural language request and extract a potential action (Task, Goal, Note, or Event).
Return ONLY a valid JSON object with the following structure:
{
  "type": "task" | "goal" | "note" | "event",
  "title": "Action title",
  "description": "Optional details",
  "suggestedGoal": "A goal that this action might belong to (e.g., 'Beautify Home')",
  "suggestedProject": "A project that this goal/action might belong to (e.g., 'Home')"
}

Example:
Input: "I need to cut the grass"
Output: { "type": "task", "title": "Cut the grass", "suggestedGoal": "Beautify Home", "suggestedProject": "Home" }

IMPORTANT: Return ONLY the JSON. No conversational text.`,
        profiling: `Based on the following user data (Projects, Goals, Tasks), generate a professional, high-level summary of the user's focus, productivity patterns, and "Digital Persona".
        
        Data:
        {{context}}
        
        The summary should:
        1.  Identify the user's primary focus areas.
        2.  Analyze their approach to productivity (e.g., highly organized, action-oriented, big-picture thinker).
        3.  Suggest potential growth areas or system optimizations.
        
        Maintain a professional and sophisticated OS Persona. Use Markdown for formatting. Avoid listing raw tasks; instead, synthesize them into insights.`
    }
};
