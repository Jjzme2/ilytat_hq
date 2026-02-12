import { LogLevel, type LogEntry, type LoggerTransport } from '../types';

export class ConsoleTransport implements LoggerTransport {
    constructor(private options: { json?: boolean } = {}) { }

    log(entry: LogEntry): void {
        if (this.options.json || process.env.NODE_ENV === 'production') {
            console.log(JSON.stringify(entry));
            return;
        }

        // Pretty print for development
        const color = this.getColor(entry.level);
        const reset = '\x1b[0m';
        const timestamp = new Date(entry.timestamp).toLocaleTimeString();

        // Format context nicely
        const { correlationId, ...restContext } = entry.context;
        const contextStr = Object.keys(restContext).length ? `\n${JSON.stringify(restContext, null, 2)}` : '';
        const cidStr = correlationId ? `[${correlationId}]` : '';

        const msg = `${color}[${entry.level}]${reset} ${timestamp} ${cidStr} ${entry.message}${contextStr}`;

        if (entry.level === 'ERROR' || entry.level === 'FATAL') {
            console.error(msg);
            if (entry.error) console.error(entry.error);
        } else {
            console.log(msg);
        }
    }

    private getColor(level: string): string {
        switch (level) {
            case 'DEBUG': return '\x1b[34m'; // Blue
            case 'INFO': return '\x1b[32m';  // Green
            case 'WARN': return '\x1b[33m';  // Yellow
            case 'ERROR': return '\x1b[31m'; // Red
            case 'FATAL': return '\x1b[41m\x1b[37m'; // Red BG, White Test
            case 'SYSTEM': return '\x1b[90m'; // Grey
            default: return '\x1b[37m';
        }
    }
}
