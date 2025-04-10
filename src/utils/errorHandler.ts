import { logger } from './logger';

/**
 * Custom error class for Not Found errors
 */
export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

/**
 * Custom error class for Authentication errors
 */
export class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthError';
    }
}

/**
 * Custom error class for Validation errors
 */
export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

/**
 * Error handler middleware for Express
 */
export function errorHandlerMiddleware(err: any, req: any, res: any, next: any): void {
    logger.error(`Error: ${err.message || 'Unknown error'}`);
    
    // Format error response
    const errorResponse = {
        error: {
            message: err.message || 'An error occurred',
            code: err.name || 'ERROR'
        }
    };
    
    // Map error types to status codes
    if (err instanceof NotFoundError) {
        res.status(404).json(errorResponse);
    } else if (err instanceof AuthError) {
        res.status(401).json(errorResponse);
    } else if (err instanceof ValidationError) {
        res.status(400).json(errorResponse);
    } else {
        // Default to 500 for unknown errors
        res.status(500).json(errorResponse);
    }
} 