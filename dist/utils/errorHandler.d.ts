/**
 * Error handling and recovery utilities
 */
/**
 * Custom error types
 */
export declare class McpError extends Error {
    statusCode: number;
    code: string;
    details?: any;
    constructor(message: string, statusCode?: number, code?: string, details?: any);
}
export declare class ValidationError extends McpError {
    constructor(message: string, details?: any);
}
export declare class AuthenticationError extends McpError {
    constructor(message: string, details?: any);
}
export declare class AuthorizationError extends McpError {
    constructor(message: string, details?: any);
}
export declare class NotFoundError extends McpError {
    constructor(message: string, details?: any);
}
export declare class ConflictError extends McpError {
    constructor(message: string, details?: any);
}
export declare class RateLimitError extends McpError {
    constructor(message: string, details?: any);
}
/**
 * Format an error response for API endpoints
 */
export declare function formatErrorResponse(error: any): {
    error: {
        message: string;
        code: string;
        details: any;
    };
    statusCode: number;
} | {
    error: {
        message: string;
        code: string;
        details?: undefined;
    };
    statusCode: number;
};
/**
 * Express error handler middleware
 */
export declare function errorHandlerMiddleware(err: any, req: any, res: any, next: Function): void;
/**
 * Safely stringify an object, handling circular references
 */
export declare function safeStringify(obj: any, indent?: number): string;
/**
 * Retry a function with exponential backoff
 */
export declare function retry<T>(fn: () => Promise<T>, options?: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
    shouldRetry?: (error: any) => boolean;
    onRetry?: (error: any, attempt: number, delay: number) => void;
}): Promise<T>;
/**
 * Wrap an async function with a timeout
 */
export declare function withTimeout<T>(fn: () => Promise<T>, timeoutMs: number, timeoutMessage?: string): Promise<T>;
/**
 * Create a rate limiter
 */
export declare function createRateLimiter(options?: {
    windowMs?: number;
    maxRequests?: number;
    message?: string;
}): (clientId: string) => void;
/**
 * Circuit breaker pattern implementation
 */
export declare class CircuitBreaker {
    private state;
    private failureCount;
    private successCount;
    private lastFailureTime;
    private readonly failureThreshold;
    private readonly resetTimeout;
    private readonly successThreshold;
    constructor(options?: {
        failureThreshold?: number;
        resetTimeout?: number;
        successThreshold?: number;
    });
    /**
     * Execute a function with circuit breaker protection
     */
    execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T>;
    /**
     * Handle successful execution
     */
    private onSuccess;
    /**
     * Handle failed execution
     */
    private onFailure;
    /**
     * Get the current state of the circuit breaker
     */
    getState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    /**
     * Reset the circuit breaker to closed state
     */
    reset(): void;
}
