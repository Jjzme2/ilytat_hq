import { LogLevel, type LogContext, type LogEntry, type LoggerOptions, type LoggerTransport } from './types';
import { ConsoleTransport } from './transports/ConsoleTransport';

export class Logger {
    private level: LogLevel;
    private transports: LoggerTransport[];
    private context: LogContext;
    private static instance: Logger;

    constructor(options: LoggerOptions) {
        this.level = options.level;
        this.transports = options.transports;
        this.context = options.defaultContext || {};
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger({
                level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
                transports: [new ConsoleTransport()]
            });
        }
        return Logger.instance;
    }

    public withContext(ctx: LogContext): Logger {
        // Create a new logger instance sharing transports but with extended context
        // OR just return a proxy that merges context. 
        // For Enterprise grade, creating child loggers is strict.
        const child = new Logger({
            level: this.level,
            transports: this.transports,
            defaultContext: { ...this.context, ...ctx }
        });
        return child;
    }

    private log(level: LogLevel, message: string, meta: LogContext = {}, error?: Error) {
        if (level < this.level) return;

        const levelName = LogLevel[level];
        const entry: LogEntry = {
            level: levelName,
            message,
            context: { ...this.context, ...meta },
            timestamp: new Date().toISOString(),
            error
        };

        this.transports.forEach(t => t.log(entry));
    }

    public debug(message: string, meta?: LogContext) { this.log(LogLevel.DEBUG, message, meta); }
    public info(message: string, meta?: LogContext) { this.log(LogLevel.INFO, message, meta); }
    public warn(message: string, meta?: LogContext) { this.log(LogLevel.WARN, message, meta); }
    public error(message: string, error?: Error | unknown, meta?: LogContext) {
        this.log(LogLevel.ERROR, message, meta, error instanceof Error ? error : (error ? new Error(String(error)) : undefined));
    }
    public fatal(message: string, error?: Error | unknown, meta?: LogContext) {
        this.log(LogLevel.FATAL, message, meta, error instanceof Error ? error : (error ? new Error(String(error)) : undefined));
    }
    public system(message: string, meta?: LogContext) { this.log(LogLevel.SYSTEM, message, meta); }
}
