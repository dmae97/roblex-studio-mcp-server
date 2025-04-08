/**
 * Error handling and recovery utilities
 */
import { logger } from './logger.js';
/**
 * Custom error types
 */
export class McpError extends Error {
    statusCode;
    code;
    details;
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        // Explicitly set the prototype for proper instanceof checks in ES6+
        Object.setPrototypeOf(this, McpError.prototype);
    }
}
export class ValidationError extends McpError {
    constructor(message, details) {
        super(message, 400, 'VALIDATION_ERROR', details);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
export class AuthenticationError extends McpError {
    constructor(message, details) {
        super(message, 401, 'AUTHENTICATION_ERROR', details);
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}
export class AuthorizationError extends McpError {
    constructor(message, details) {
        super(message, 403, 'AUTHORIZATION_ERROR', details);
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }
}
export class NotFoundError extends McpError {
    constructor(message, details) {
        super(message, 404, 'NOT_FOUND', details);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
export class ConflictError extends McpError {
    constructor(message, details) {
        super(message, 409, 'CONFLICT', details);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}
export class RateLimitError extends McpError {
    constructor(message, details) {
        super(message, 429, 'RATE_LIMIT', details);
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}
/**
 * Format an error response for API endpoints
 */
export function formatErrorResponse(error) {
    if (error instanceof McpError) {
        return {
            error: {
                message: error.message,
                code: error.code,
                details: error.details
            },
            statusCode: error.statusCode
        };
    }
    // For non-McpError errors, return a generic internal error
    logger.error(`Unhandled error: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error && error.stack) {
        logger.debug(error.stack);
    }
    return {
        error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR'
        },
        statusCode: 500
    };
}
/**
 * Express error handler middleware
 */
export function errorHandlerMiddleware(err, req, res, next) {
    const errorResponse = formatErrorResponse(err);
    res.status(errorResponse.statusCode).json({
        error: errorResponse.error
    });
}
/**
 * Safely stringify an object, handling circular references
 */
export function safeStringify(obj, indent = 2) {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }
        return value;
    }, indent);
}
/**
 * Retry a function with exponential backoff
 */
export async function retry(fn, options = {}) {
    const { maxRetries = 3, initialDelay = 1000, maxDelay = 30000, factor = 2, shouldRetry = () => true, onRetry } = options;
    let attempt = 0;
    while (true) {
        try {
            return await fn();
        }
        catch (error) {
            attempt++;
            if (attempt > maxRetries || !shouldRetry(error)) {
                throw error;
            }
            const delay = Math.min(initialDelay * Math.pow(factor, attempt - 1), maxDelay);
            if (onRetry) {
                onRetry(error, attempt, delay);
            }
            else {
                logger.warn(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms: ${error instanceof Error ? error.message : String(error)}`);
            }
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
/**
 * Wrap an async function with a timeout
 */
export function withTimeout(fn, timeoutMs, timeoutMessage = 'Operation timed out') {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new McpError(timeoutMessage, 408, 'TIMEOUT'));
        }, timeoutMs);
        fn().then(result => {
            clearTimeout(timeoutId);
            resolve(result);
        }, error => {
            clearTimeout(timeoutId);
            reject(error);
        });
    });
}
/**
 * Create a rate limiter
 */
export function createRateLimiter(options = {}) {
    const { windowMs = 60 * 1000, // 1 minute
    maxRequests = 100, // 100 requests per minute
    message = 'Too many requests, please try again later' } = options;
    const clients = new Map();
    return function rateLimit(clientId) {
        const now = Date.now();
        let client = clients.get(clientId);
        // Create or reset client if needed
        if (!client || now > client.resetTime) {
            client = {
                count: 0,
                resetTime: now + windowMs
            };
            clients.set(clientId, client);
        }
        // Increment request count
        client.count++;
        // Check if rate limit exceeded
        if (client.count > maxRequests) {
            throw new RateLimitError(message, {
                limit: maxRequests,
                remaining: 0,
                reset: Math.ceil((client.resetTime - now) / 1000) // seconds until reset
            });
        }
    };
}
/**
 * Circuit breaker pattern implementation
 */
export class CircuitBreaker {
    state = 'CLOSED';
    failureCount = 0;
    successCount = 0;
    lastFailureTime = 0;
    failureThreshold;
    resetTimeout;
    successThreshold;
    constructor(options = {}) {
        this.failureThreshold = options.failureThreshold || 5;
        this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
        this.successThreshold = options.successThreshold || 2;
    }
    /**
     * Execute a function with circuit breaker protection
     */
    async execute(fn, fallback) {
        if (this.state === 'OPEN') {
            if (Date.now() > this.lastFailureTime + this.resetTimeout) {
                this.state = 'HALF_OPEN';
                logger.info('Circuit breaker state changed from OPEN to HALF_OPEN');
            }
            else if (fallback) {
                return fallback();
            }
            else {
                throw new McpError('Circuit breaker is open', 503, 'CIRCUIT_OPEN');
            }
        }
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            if (fallback) {
                return fallback();
            }
            throw error;
        }
    }
    /**
     * Handle successful execution
     */
    onSuccess() {
        if (this.state === 'HALF_OPEN') {
            this.successCount++;
            if (this.successCount >= this.successThreshold) {
                this.successCount = 0;
                this.failureCount = 0;
                this.state = 'CLOSED';
                logger.info('Circuit breaker state changed from HALF_OPEN to CLOSED');
            }
        }
        else {
            this.failureCount = 0;
        }
    }
    /**
     * Handle failed execution
     */
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if ((this.state === 'CLOSED' && this.failureCount >= this.failureThreshold) ||
            this.state === 'HALF_OPEN') {
            this.state = 'OPEN';
            this.successCount = 0;
            logger.warn(`Circuit breaker state changed to OPEN (failures: ${this.failureCount})`);
        }
    }
    /**
     * Get the current state of the circuit breaker
     */
    getState() {
        return this.state;
    }
    /**
     * Reset the circuit breaker to closed state
     */
    reset() {
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.successCount = 0;
        logger.info('Circuit breaker has been manually reset to CLOSED');
    }
}
//# sourceMappingURL=errorHandler.js.map