export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly context?: Record<string, any>;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        code: string = 'INTERNAL_ERROR',
        statusCode: number = 500,
        context?: Record<string, any>,
        isOperational: boolean = true
    ) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.context = context;
        this.isOperational = isOperational;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }

    public toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            context: this.context,
            stack: this.stack
        };
    }
}

export class NetworkError extends AppError {
    constructor(message: string = 'Network request failed', context?: Record<string, any>) {
        super(message, 'NETWORK_ERROR', 0, context, true);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, 'VALIDATION_ERROR', 400, context, true);
    }
}

export class PermissionError extends AppError {
    constructor(message: string = 'Permission denied', context?: Record<string, any>) {
        super(message, 'PERMISSION_DENIED', 403, context, true);
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string, id?: string) {
        super(`${resource} not found${id ? ` (ID: ${id})` : ''}`, 'NOT_FOUND', 404, { resource, id }, true);
    }
}
