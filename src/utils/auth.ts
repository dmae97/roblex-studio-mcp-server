import crypto from 'crypto';
import { logger } from './logger';

// Store for API keys, sessions and tokens
const apiKeys: Map<string, { name: string; role: string }> = new Map();
const sessions: Map<string, { 
    userId: string; 
    role: string; 
    ip: string; 
    lastActivity: number;
}> = new Map();

// Session timeout in seconds (default: 1 hour)
const SESSION_TIMEOUT = Number(process.env.SESSION_TIMEOUT || 3600);

/**
 * Initialize authentication system
 */
export function init(): void {
    logger.info('Initializing authentication system');
    
    // Load API keys from environment
    if (process.env.API_KEYS) {
        try {
            const keys = process.env.API_KEYS.split(',');
            
            for (const keyPair of keys) {
                const [key, info] = keyPair.split(':');
                if (!key || !info) continue;
                
                const [name, role] = info.split(';');
                if (!name) continue;
                
                apiKeys.set(key.trim(), { 
                    name: name.trim(), 
                    role: role?.trim() || 'user' 
                });
                
                logger.info(`Registered API key for: ${name}`);
            }
        } catch (error) {
            logger.error(`Error loading API keys: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

/**
 * Verify an API key
 */
export function verifyApiKey(apiKey: string): { valid: boolean; name?: string; role?: string } {
    const keyInfo = apiKeys.get(apiKey);
    
    if (!keyInfo) {
        logger.warn(`Invalid API key attempt`);
        return { valid: false };
    }
    
    logger.info(`API key verified for: ${keyInfo.name}`);
    return { valid: true, name: keyInfo.name, role: keyInfo.role };
}

/**
 * Generate a session ID
 */
export function generateSessionId(prefix: string = 'session'): string {
    return `${prefix}_${crypto.randomUUID()}`;
}

/**
 * Register a new session
 */
export function registerSession(sessionId: string, userId: string, role: string, ip: string): void {
    sessions.set(sessionId, {
        userId,
        role,
        ip,
        lastActivity: Date.now()
    });
    
    logger.info(`Session registered: ${sessionId} for ${userId}`);
}

/**
 * Check if a session is valid
 */
export function isSessionValid(sessionId: string): boolean {
    const session = sessions.get(sessionId);
    
    if (!session) {
        return false;
    }
    
    // Check if session has expired
    const elapsed = (Date.now() - session.lastActivity) / 1000;
    return elapsed < SESSION_TIMEOUT;
}

/**
 * Update session activity timestamp
 */
export function updateSessionActivity(sessionId: string): void {
    const session = sessions.get(sessionId);
    
    if (session) {
        session.lastActivity = Date.now();
    }
}

/**
 * Revoke a session
 */
export function revokeSession(sessionId: string): void {
    if (sessions.has(sessionId)) {
        logger.info(`Session revoked: ${sessionId}`);
        sessions.delete(sessionId);
    }
}

/**
 * Create an authentication token
 */
export function createToken(payload: Record<string, any>): string {
    // In a production system, use a proper JWT library
    // This is a simplified implementation
    const tokenData = Buffer.from(JSON.stringify(payload)).toString('base64');
    return tokenData;
}

/**
 * Authentication middleware for Express
 */
export function apiKeyAuth(req: any, res: any, next: () => void): void {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    
    if (!apiKey) {
        return res.status(401).json({ error: 'API key required' });
    }
    
    const result = verifyApiKey(apiKey);
    
    if (!result.valid) {
        return res.status(403).json({ error: 'Invalid API key' });
    }
    
    // Attach API key info to request
    req.apiKey = {
        name: result.name,
        role: result.role
    };
    
    next();
} 