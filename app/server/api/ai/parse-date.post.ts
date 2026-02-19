import { defineEventHandler, readBody } from 'h3';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Server configuration error: Missing AI API Key'
        });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const body = await readBody(event);
    const { input, timezoneOffset } = body;

    if (!input) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Input is required'
        });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const now = new Date();
        const prompt = `
        Current Date/Time: ${now.toISOString()}
        User Timezone Offset (minutes): ${timezoneOffset}
        
        Extract the following from the user input:
        1. Title: Create a concise title.
        2. Start: ISO 8601 date string. If time is not specified, default to next logical time or all-day.
        3. End: ISO 8601 date string. Default duration: 1 hour for events.
        4. Type: 'event' or 'task'. Default to 'event'.
        5. Description: Any extra details.

        User Input: "${input}"

        Return ONLY raw JSON:
        {
            "title": "string",
            "start": "ISO string",
            "end": "ISO string",
            "type": "event" | "task",
            "description": "string"
        }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean markdown code blocks if present
        const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonString);

        return parsed;

    } catch (error) {
        console.error('AI Date Parse Error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to parse date'
        });
    }
});
