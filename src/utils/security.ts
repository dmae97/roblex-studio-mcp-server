/**
 * Security utilities for protecting MCP server against various attacks
 * including TPA (Third-Party API) attacks
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';
import { RateLimitError } from './errorHandler';

// Allowed domains for API requests (CORS protection)
const ALLOWED_DOMAINS: string[] = [
  'localhost',
  '127.0.0.1',
  // Add your trusted domains here
];

// Blocked request patterns (to prevent TPA attacks)
const BLOCKED_PATTERNS: RegExp[] = [
  // Block requests to common external API endpoints
  /amazonaws\.com/i,
  /api\.openai\.com/i,
  /api\.anthropic\.com/i,
  /api\.github\.com/i,
  /api\.stripe\.com/i,
  /firebaseio\.com/i,
  /googleapis\.com/i,
  /hooks\.slack\.com/i,
  // Add more patterns as needed
];

// Block suspicious URL parameters
const SUSPICIOUS_PARAMS: string[] = [
  'token',
  'key',
  'apikey',
  'api_key',
  'password',
  'secret',
  'access_token',
  'auth'
];

// API request rate limiting
interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private clients: Map<string, RateLimitEntry> = new Map();
  private windowMs: number;
  private maxRequests: number;
  private message: string;

  constructor(options: RateLimitOptions) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
    this.message = options.message;
  }

  check(clientId: string): void {
    const now = Date.now();
    let entry = this.clients.get(clientId);

    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + this.windowMs
      };
      this.clients.set(clientId, entry);
    }

    entry.count++;

    if (entry.count > this.maxRequests) {
      throw new RateLimitError(this.message, {
        limit: this.maxRequests,
        remaining: 0,
        reset: Math.ceil((entry.resetTime - now) / 1000)
      });
    }
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [clientId, entry] of this.clients.entries()) {
      if (now > entry.resetTime) {
        this.clients.delete(clientId);
      }
    }
  }
}

// Create rate limiter instance
const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,    // 100 requests per minute
  message: 'Too many requests from this IP, please try again later'
});

// Start periodic cleanup
setInterval(() => apiRateLimiter.cleanup(), 5 * 60 * 1000); // Every 5 minutes

/**
 * Middleware to apply rate limiting
 */
export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const clientId = req.ip || 'unknown';
    apiRateLimiter.check(clientId);
    next();
  } catch (error) {
    if (error instanceof RateLimitError) {
      logger.warn(`Rate limit exceeded for ${req.ip}`);
      res.status(429).json({
        error: error.message,
        retryAfter: error.details?.reset || 60
      });
    } else {
      next(error);
    }
  }
}

/**
 * Middleware to protect against TPA attacks by validating requests
 */
export function tpaProtectionMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Check request origin
  const origin = req.headers.origin || '';
  if (origin && !isAllowedOrigin(origin)) {
    logger.warn(`Blocked request from unauthorized origin: ${origin}`);
    return res.status(403).json({ error: 'Unauthorized request origin' });
  }

  // Check request URL for suspicious patterns
  const url = req.originalUrl || req.url;
  if (containsBlockedPattern(url)) {
    logger.warn(`Blocked request with suspicious URL pattern: ${url}`);
    return res.status(403).json({ error: 'Unauthorized request URL' });
  }

  // Check request body for suspicious patterns
  if (req.body && typeof req.body === 'object') {
    const bodyString = JSON.stringify(req.body);
    if (containsBlockedPattern(bodyString)) {
      logger.warn(`Blocked request with suspicious payload`);
      return res.status(403).json({ error: 'Unauthorized request content' });
    }
  }

  // Check for suspicious query parameters
  const queryParams = Object.keys(req.query);
  for (const param of queryParams) {
    if (SUSPICIOUS_PARAMS.includes(param.toLowerCase())) {
      logger.warn(`Blocked request with suspicious query parameter: ${param}`);
      return res.status(403).json({ error: 'Unauthorized query parameters' });
    }
  }

  next();
}

/**
 * Helper: Check if request origin is allowed
 */
function isAllowedOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    
    // Allow all localhost and IP addresses during development
    if (process.env.NODE_ENV === 'development') {
      if (hostname === 'localhost' || hostname === '127.0.0.1' || /^192\.168\./.test(hostname)) {
        return true;
      }
    }
    
    return ALLOWED_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch (e) {
    return false;
  }
}

/**
 * Helper: Check if string contains any blocked pattern
 */
function containsBlockedPattern(str: string): boolean {
  return BLOCKED_PATTERNS.some(pattern => pattern.test(str));
}

/**
 * Add a domain to the allowed list (for dynamic configuration)
 */
export function addAllowedDomain(domain: string): void {
  if (!ALLOWED_DOMAINS.includes(domain)) {
    ALLOWED_DOMAINS.push(domain);
    logger.info(`Added ${domain} to allowed domains list`);
  }
}

/**
 * Add a blocked pattern (for dynamic configuration)
 */
export function addBlockedPattern(pattern: RegExp): void {
  const patternString = pattern.toString();
  if (!BLOCKED_PATTERNS.some(p => p.toString() === patternString)) {
    BLOCKED_PATTERNS.push(pattern);
    logger.info(`Added ${patternString} to blocked patterns list`);
  }
}

/**
 * Middleware to sanitize request inputs
 */
export function sanitizeInputsMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Function to sanitize a string
  const sanitize = (str: string): string => {
    // Basic sanitization: remove script tags, SQL injection patterns, etc.
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/(\b)(on\S+)(\s*)=/gi, '$1_$2$3=') // Disable JS event handlers
      .replace(/javascript:/gi, 'blocked:')
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b/gi, 'BLOCKED')
      .replace(/['";]/g, ''); // Remove quotes that might be used in SQL injection
  };

  // Sanitize query parameters
  for (const key in req.query) {
    if (typeof req.query[key] === 'string') {
      req.query[key] = sanitize(req.query[key] as string);
    }
  }

  // Sanitize body if it's an object (JSON)
  if (req.body && typeof req.body === 'object') {
    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
      }
      
      const result: any = {};
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          result[key] = sanitize(obj[key]);
        } else if (typeof obj[key] === 'object') {
          result[key] = sanitizeObject(obj[key]);
        } else {
          result[key] = obj[key];
        }
      }
      return result;
    };
    
    req.body = sanitizeObject(req.body);
  }

  next();
}

/**
 * Middleware to set secure HTTP headers
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline';");
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  
  next();
}

/**
 * Log suspicious activity
 */
export function logSuspiciousActivity(req: Request, activity: string): void {
  logger.warn(`Suspicious activity detected: ${activity}`, {
    ip: req.ip,
    url: req.originalUrl,
    method: req.method,
    userAgent: req.headers['user-agent']
  });
}

// Export all security utilities
export const security = {
  rateLimitMiddleware,
  tpaProtectionMiddleware,
  sanitizeInputsMiddleware,
  securityHeadersMiddleware,
  addAllowedDomain,
  addBlockedPattern,
  logSuspiciousActivity
};

export default security;
