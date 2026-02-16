/**
 * @file tests/security/reporter.ts
 * @description Helper to log security vulnerabilities
 */

import * as fs from 'fs';
import * as path from 'path';

const LOG_FILE = path.resolve(__dirname, '../../security_audit.log');

// Clear log file on start (optional, maybe append is better, but clear for now for fresh run)
if (fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, '');
}

export function logVulnerability(type: string, message: string) {
    const logEntry = `[VULNERABILITY] [Type: ${type}] ${message}\n`;
    console.error(logEntry); // Also print to stderr
    fs.appendFileSync(LOG_FILE, logEntry);
}
