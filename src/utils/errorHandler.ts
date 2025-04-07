/**
 * Error handling and recovery utilities
 */

import { logger } from './logger.js';

/**
 * Custom error types
 */
export class McpError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
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
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthenticationError extends McpError {
  constructor(message: string, details?: any) {
    super(message, 401, 'AUTHENTICATION_ERROR', details);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends McpError {
  constructor(message: string, details?: any) {
    super(message, 403, 'AUTHORIZATION_ERROR', details);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class NotFoundError extends McpError {
  constructor(message: string, details?: any) {
    super(message, 404, 'NOT_FOUND', details);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends McpError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class RateLimitError extends McpError {
  constructor(message: string, details?: any) {
    super(message, 429, 'RATE_LIMIT', details);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Format an error response for API endpoints
 */
export function formatErrorResponse(error: any) {
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
export function errorHandlerMiddleware(err: any, req: any, res: any, next: Function) {
  const errorResponse = formatErrorResponse(err);
  
  res.status(errorResponse.statusCode).json({
    error: errorResponse.error
  });
}

/**
 * Safely stringify an object, handling circular references
 */
export function safeStringify(obj: any, indent: number = 2): string {
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
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
    shouldRetry?: (error: any) => boolean;
    onRetry?: (error: any, attempt: number, delay: number) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    factor = 2,
    shouldRetry = () => true,
    onRetry
  } = options;
  
  let attempt = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      
      if (attempt > maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      const delay = Math.min(initialDelay * Math.pow(factor, attempt - 1), maxDelay);
      
      if (onRetry) {
        onRetry(error, attempt, delay);
      } else {
        logger.warn(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Wrap an async function with a timeout
 */
export function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new McpError(timeoutMessage, 408, 'TIMEOUT'));
    }, timeoutMs);
    
    fn().then(
      result => {
        clearTimeout(timeoutId);
        resolve(result);
      },
      error => {
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

/**
 * Create a rate limiter
 */
export function createRateLimiter(options: {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
} = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute
    maxRequests = 100,    // 100 requests per minute
    message = 'Too many requests, please try again later'
  } = options;
  
  const clients: Map<string, { count: number, resetTime: number }> = new Map();
  
  return function rateLimit(clientId: string): void {
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
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly successThreshold: number;
  
  constructor(options: {
    failureThreshold?: number;
    resetTimeout?: number;
    successThreshold?: number;
  } = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
    this.successThreshold = options.successThreshold || 2;
  }
  
  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() > this.lastFailureTime + this.resetTimeout) {
        this.state = 'HALF_OPEN';
        logger.info('Circuit breaker state changed from OPEN to HALF_OPEN');
      } else if (fallback) {
        return fallback();
      } else {
        throw new McpError('Circuit breaker is open', 503, 'CIRCUIT_OPEN');
      }
    }
    
    try {
      const result = await fn();
      
      this.onSuccess();
      return result;
    } catch (error) {
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
  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      
      if (this.successCount >= this.successThreshold) {
        this.successCount = 0;
        this.failureCount = 0;
        this.state = 'CLOSED';
        logger.info('Circuit breaker state changed from HALF_OPEN to CLOSED');
      }
    } else {
      this.failureCount = 0;
    }
  }
  
  /**
   * Handle failed execution
   */
  private onFailure(): void {
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
  getState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
    return this.state;
  }
  
  /**
   * Reset the circuit breaker to closed state
   */
  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    logger.info('Circuit breaker has been manually reset to CLOSED');
  }
} 