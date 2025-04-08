"use strict";
/**
 * Error handling and recovery utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = exports.createRateLimiter = exports.withTimeout = exports.retry = exports.safeStringify = exports.errorHandlerMiddleware = exports.formatErrorResponse = exports.DatastoreError = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.McpError = void 0;
const logger_js_1 = require("./logger.js");
/**
 * Custom error types
 */
class McpError extends Error {
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
exports.McpError = McpError;
class ValidationError extends McpError {
    constructor(message, details) {
        super(message, 400, 'VALIDATION_ERROR', details);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends McpError {
    constructor(message, details) {
        super(message, 401, 'AUTHENTICATION_ERROR', details);
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends McpError {
    constructor(message, details) {
        super(message, 403, 'AUTHORIZATION_ERROR', details);
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends McpError {
    constructor(message, details) {
        super(message, 404, 'NOT_FOUND', details);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends McpError {
    constructor(message, details) {
        super(message, 409, 'CONFLICT', details);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}
exports.ConflictError = ConflictError;
class RateLimitError extends McpError {
    constructor(message, details) {
        super(message, 429, 'RATE_LIMIT', details);
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}
exports.RateLimitError = RateLimitError;
// Add a specific error class for datastore issues
class DatastoreError extends McpError {
    constructor(message = 'Datastore operation failed', details) {
        super(message, 500, 'DATASTORE_ERROR', details);
        Object.setPrototypeOf(this, DatastoreError.prototype);
    }
}
exports.DatastoreError = DatastoreError;
/**
 * Format an error response for API endpoints
 */
function formatErrorResponse(error) {
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
    logger_js_1.logger.error(`Unhandled error: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error && error.stack) {
        logger_js_1.logger.debug(error.stack);
    }
    return {
        error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR'
        },
        statusCode: 500
    };
}
exports.formatErrorResponse = formatErrorResponse;
/**
 * Express error handler middleware
 */
function errorHandlerMiddleware(err, req, res, next) {
    const errorResponse = formatErrorResponse(err);
    res.status(errorResponse.statusCode).json({
        error: errorResponse.error
    });
}
exports.errorHandlerMiddleware = errorHandlerMiddleware;
/**
 * Safely stringify an object, handling circular references
 */
function safeStringify(obj, indent = 2) {
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
exports.safeStringify = safeStringify;
/**
 * Retry a function with exponential backoff
 */
async function retry(fn, options = {}) {
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
                logger_js_1.logger.warn(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms: ${error instanceof Error ? error.message : String(error)}`);
            }
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
exports.retry = retry;
/**
 * Wrap an async function with a timeout
 */
function withTimeout(fn, timeoutMs, timeoutMessage = 'Operation timed out') {
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
exports.withTimeout = withTimeout;
/**
 * Create a rate limiter
 */
function createRateLimiter(options = {}) {
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
exports.createRateLimiter = createRateLimiter;
/**
 * Circuit breaker pattern implementation
 */
class CircuitBreaker {
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
                logger_js_1.logger.info('Circuit breaker state changed from OPEN to HALF_OPEN');
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
                logger_js_1.logger.info('Circuit breaker state changed from HALF_OPEN to CLOSED');
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
            logger_js_1.logger.warn(`Circuit breaker state changed to OPEN (failures: ${this.failureCount})`);
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
        logger_js_1.logger.info('Circuit breaker has been manually reset to CLOSED');
    }
}
exports.CircuitBreaker = CircuitBreaker;
//# sourceMappingURL=errorHandler.js.map