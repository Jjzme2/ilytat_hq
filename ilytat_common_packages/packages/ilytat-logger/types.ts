export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4,
    SYSTEM = 5,
}

export interface LogContext {
    [key: string]: any;
    correlationId?: string;
    requestId?: string;
    userId?: string;
}

export interface LogEntry {
    level: string;
    message: string;
    context: LogContext;
    timestamp: string;
    error?: Error;
}

export interface LoggerTransport {
    log(entry: LogEntry): void;
}

export interface LoggerOptions {
    level: LogLevel;
    transports: LoggerTransport[];
    defaultContext?: LogContext;
}
