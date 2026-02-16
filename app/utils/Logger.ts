type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class LoggerService {
    private isDev = process.env.NODE_ENV !== 'production';

    private formatMessage(level: LogLevel, message: string, context?: any) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    }

    debug(message: string, context?: any) {
        if (this.isDev) {
            console.debug(this.formatMessage('debug', message), context || '');
        }
    }

    info(message: string, context?: any) {
        console.info(this.formatMessage('info', message), context || '');
    }

    warn(message: string, context?: any) {
        console.warn(this.formatMessage('warn', message), context || '');
    }

    error(message: string, error?: any, context?: any) {
        console.error(this.formatMessage('error', message), error || '', context || '');
    }
}

export const Logger = new LoggerService();
