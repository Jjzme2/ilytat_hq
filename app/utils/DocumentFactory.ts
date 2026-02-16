export class DocumentFactory {
    /**
     * Extracts variable names from a template string.
     * Matches {{variable}} pattern.
     */
    static extractVariables(template: string): string[] {
        const regex = /\{\{([^}]+)\}\}/g;
        const matches = [...template.matchAll(regex)];
        // Return unique variable names, trimmed
        return [...new Set(matches.map(m => m[1] ? m[1].trim() : ''))].filter(Boolean);
    }

    /**
     * Compiles a template by substituting variables with data.
     */
    static compile(template: string, data: Record<string, any>): string {
        return template.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
            const key = variable.trim();
            return data[key] !== undefined ? String(data[key]) : match;
        });
    }

    /**
     * Triggers the browser print dialog for the given content.
     * In a real app, this might generate a PDF.
     * For now, we'll open a new window and print it.
     */
    static print(title: string, content: string) {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to print documents.');
            return;
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: sans-serif; padding: 40px; line-height: 1.6; white-space: pre-wrap; }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                ${content}
                <script>
                    window.onload = () => {
                        window.print();
                        // Optional: window.close();
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    }
}
