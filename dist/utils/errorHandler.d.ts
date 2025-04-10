/**
 * Custom error class for Not Found errors
 */
export declare class NotFoundError extends Error {
    constructor(message: string);
}
/**
 * Custom error class for Authentication errors
 */
export declare class AuthError extends Error {
    constructor(message: string);
}
/**
 * Custom error class for Validation errors
 */
export declare class ValidationError extends Error {
    constructor(message: string);
}
/**
 * Error handler middleware for Express
 */
export declare function errorHandlerMiddleware(err: any, req: any, res: any, next: any): void;
