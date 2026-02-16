export type LogLevel = 'verbose' | 'debug' | 'info' | 'warn' | 'error' | 'none';

const LogLevels: Record<LogLevel, number> = {
    verbose: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    none: 5
};

class LoggerService {
    private get level(): number {
        const config = useRuntimeConfig();
        const level = (config.public.logLevel as LogLevel) || 'info';
        return LogLevels[level] ?? LogLevels.info;
    }

    private formatMessage(level: string, message: string): string {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    }

    verbose(message: string, ...args: any[]) {
        if (this.level <= LogLevels.verbose) {
            console.log(this.formatMessage('verbose', message), ...args);
        }
    }

    debug(message: string, ...args: any[]) {
        if (this.level <= LogLevels.debug) {
            console.debug(this.formatMessage('debug', message), ...args);
        }
    }

    info(message: string, ...args: any[]) {
        if (this.level <= LogLevels.info) {
            console.info(this.formatMessage('info', message), ...args);
        }
    }

    warn(message: string, ...args: any[]) {
        if (this.level <= LogLevels.warn) {
            console.warn(this.formatMessage('warn', message), ...args);
        }
    }

    error(message: string, ...args: any[]) {
        if (this.level <= LogLevels.error) {
            console.error(this.formatMessage('error', message), ...args);
        }
    }
}

export const Logger = new LoggerService();
