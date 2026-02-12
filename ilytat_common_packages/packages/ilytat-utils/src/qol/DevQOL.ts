const API_BASE = "https://common.ilytat.com/api";

interface Quote {
    id: string;
    content: string;
    author: string;
    source: string | null;
    tags: string[];
    notes: string | null;
}

interface CommonResponse<T> {
    status: string;
    metadata: any;
    payload: T;
}

export interface DevQOLConfig {
    apiBase?: string;
}

interface AsciiArt {
    id: string;
    label: string;
    content: string;
    tags: string[];
}

export const DevQOL = {
    async getMorningMessage(config: DevQOLConfig = {}): Promise<string> {
        const hour = new Date().getHours();
        let greeting = "Good Evening";
        if (hour < 12) greeting = "Good Morning";
        else if (hour < 18) greeting = "Good Afternoon";

        const date = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const apiBase = config.apiBase || API_BASE;
        let quote = "Code is like humor. When you have to explain it, it’s bad.";
        let asciiArt = "";

        try {
            // Fetch Quote
            const quoteResponse = await fetch(`${apiBase}/quotes`);
            if (quoteResponse.ok) {
                const data = await quoteResponse.json() as CommonResponse<Quote[]>;
                const quotes = data.payload;

                if (quotes && quotes.length > 0) {
                    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
                    const selectedQuote = quotes[dayOfYear % quotes.length];
                    if (selectedQuote) {
                        quote = `${selectedQuote.content} - ${selectedQuote.author}`;
                    }
                }
            }

            // Fetch ASCII Art from JSON collection
            try {
                // Fetch from the new /ascii-arts endpoint
                const asciiResponse = await fetch(`${apiBase}/ascii-arts`);
                if (asciiResponse.ok) {
                    const asciiData = await asciiResponse.json() as CommonResponse<AsciiArt[]>;
                    const collection = asciiData.payload;

                    if (collection && collection.length > 0) {
                        const randomArt = collection[Math.floor(Math.random() * collection.length)];
                        if (randomArt) {
                            asciiArt = randomArt.content;
                        }
                    }
                } else {
                    throw new Error("ASCII endpoint unreachable");
                }
            } catch (e) {
                // Fallback ASCII
                asciiArt = `
  ___ __  _ ____ ___  ___ 
 | _ )  \\| |__  | _ \\/ __|
 | _ \\ |)  | / /|  _/ (__ 
 |___/___/_|/_/_|_|  \\___|
`.trim();
            }

        } catch (e) {
            console.error("Failed to fetch DevQOL data:", e);
        }

        return `
${asciiArt}
========================================
${greeting}, Developer!
📅 Today is ${date}.
💡 Quote of the Day: "${quote}"
🚀 Ready for the coding adventure?
========================================
        `.trim();
    }
};
