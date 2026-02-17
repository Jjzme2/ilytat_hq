/**
 * Base Document Layout
 *
 * Wraps document content with a standardized header and footer
 * to ensure consistency across all ILYTAT LLC documents.
 */

import { appConfig } from "../app";

export function createBaseDocument(title: string, content: string): string {
    const header = `
${appConfig.name.toUpperCase()}
--------------------------------------------------------------------------------
${title.toUpperCase()}
--------------------------------------------------------------------------------
Date: {{date}}
Status: {{status}}
Prepared By: {{author}}
--------------------------------------------------------------------------------
`;

    const footer = `
--------------------------------------------------------------------------------
CONFIDENTIALITY NOTICE:
The contents of this document are proprietary and confidential. 
Unauthorized distribution or copying is strictly prohibited.
© ${new Date().getFullYear()} ${appConfig.name}. All Rights Reserved.
--------------------------------------------------------------------------------
`;

    return `${header.trim()}\n\n${content.trim()}\n\n${footer.trim()}`;
}
