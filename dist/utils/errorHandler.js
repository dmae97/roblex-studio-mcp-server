"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.AuthError = exports.NotFoundError = void 0;
exports.errorHandlerMiddleware = errorHandlerMiddleware;
const logger_1 = require("./logger");
/**
 * Custom error class for Not Found errors
 */
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Custom error class for Authentication errors
 */
class AuthError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthError';
    }
}
exports.AuthError = AuthError;
/**
 * Custom error class for Validation errors
 */
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
/**
 * Error handler middleware for Express
 */
function errorHandlerMiddleware(err, req, res, next) {
    logger_1.logger.error(`Error: ${err.message || 'Unknown error'}`);
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
    }
    else if (err instanceof AuthError) {
        res.status(401).json(errorResponse);
    }
    else if (err instanceof ValidationError) {
        res.status(400).json(errorResponse);
    }
    else {
        // Default to 500 for unknown errors
        res.status(500).json(errorResponse);
    }
}
//# sourceMappingURL=errorHandler.js.map