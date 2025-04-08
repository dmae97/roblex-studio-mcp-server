import crypto from 'crypto';
import { logger } from './logger.js';
/**
 * Authentication and security utilities for MCP server
 */
// Secret key for token signing (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'mcp_default_secret_key';
// Token expiration time (in seconds)
const TOKEN_EXPIRATION = parseInt(process.env.TOKEN_EXPIRATION || '3600', 10);
// List of API keys for authentication
const API_KEYS = {};
// Load API keys from environment
function loadApiKeys() {
    const apiKeyPrefix = 'MCP_API_KEY_';
    Object.keys(process.env).forEach(key => {
        if (key.startsWith(apiKeyPrefix)) {
            const name = key.substring(apiKeyPrefix.length);
            const value = process.env[key] || '';
            if (value.includes(':')) {
                const [apiKey, role] = value.split(':');
                API_KEYS[apiKey] = { name, role, enabled: true };
            }
        }
    });
    logger.info(`Loaded ${Object.keys(API_KEYS).length} API keys`);
}
// Generate a random token
export function generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}
// Generate a session ID
export function generateSessionId(prefix = 'session') {
    return `${prefix}_${Date.now()}_${generateToken(8)}`;
}
// Create a JWT token
export function createToken(payload, expiresIn = TOKEN_EXPIRATION) {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
        ...payload,
        iat: now,
        exp: now + expiresIn
    };
    const headerBase64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadBase64 = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
    const signature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${headerBase64}.${payloadBase64}`)
        .digest('base64url');
    return `${headerBase64}.${payloadBase64}.${signature}`;
}
// Verify a JWT token
export function verifyToken(token) {
    try {
        const [headerBase64, payloadBase64, signature] = token.split('.');
        const expectedSignature = crypto
            .createHmac('sha256', JWT_SECRET)
            .update(`${headerBase64}.${payloadBase64}`)
            .digest('base64url');
        if (signature !== expectedSignature) {
            return null;
        }
        const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString());
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            return null;
        }
        return payload;
    }
    catch (error) {
        logger.error(`Error verifying token: ${error instanceof Error ? error.message : String(error)}`);
        return null;
    }
}
// Verify an API key
export function verifyApiKey(apiKey) {
    if (API_KEYS[apiKey] && API_KEYS[apiKey].enabled) {
        return {
            valid: true,
            name: API_KEYS[apiKey].name,
            role: API_KEYS[apiKey].role
        };
    }
    return { valid: false };
}
// Create a hash of a string
export function createHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}
// Active sessions store
const activeSessions = {};
// Register a new session
export function registerSession(sessionId, userId, role, ipAddress) {
    if (!activeSessions[sessionId]) {
        activeSessions[sessionId] = {
            userId,
            role,
            ipAddress: ipAddress || 'unknown',
            createdAt: Date.now(),
            lastActivity: Date.now()
        };
        logger.info(`Session registered: ${sessionId} (${userId}, ${role})`);
    }
    else {
        updateSessionActivity(sessionId);
    }
}
// Update session activity
export function updateSessionActivity(sessionId) {
    if (activeSessions[sessionId]) {
        activeSessions[sessionId].lastActivity = Date.now();
    }
}
// Check if a session is valid
export function isSessionValid(sessionId) {
    return !!activeSessions[sessionId];
}
// Get session info
export function getSessionInfo(sessionId) {
    return activeSessions[sessionId];
}
// Revoke a session
export function revokeSession(sessionId) {
    if (activeSessions[sessionId]) {
        logger.debug(`Revoking session ${sessionId} for user ${activeSessions[sessionId].userId}`);
        delete activeSessions[sessionId];
    }
}
// Clean up expired sessions
export function cleanupSessions(maxAgeMs = 3600000) {
    const now = Date.now();
    const expiredSessions = Object.keys(activeSessions).filter(sessionId => (now - activeSessions[sessionId].lastActivity) > maxAgeMs);
    expiredSessions.forEach(sessionId => {
        logger.debug(`Session ${sessionId} expired, revoking`);
        revokeSession(sessionId);
    });
    logger.info(`Cleaned up ${expiredSessions.length} expired sessions`);
}
// Initialize authentication system
export function init() {
    loadApiKeys();
    // Set up session cleanup interval
    setInterval(() => cleanupSessions(), 60000); // Clean up every minute
    logger.info('Authentication system initialized');
}
// Express middleware for API key authentication
export function apiKeyAuth(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    if (!apiKey) {
        res.status(401).json({ error: 'API key required' });
        return;
    }
    const result = verifyApiKey(apiKey);
    if (!result.valid) {
        res.status(403).json({ error: 'Invalid API key' });
        return;
    }
    // Store API key info in request for later use
    req.apiKey = {
        name: result.name,
        role: result.role
    };
    next();
}
// Express middleware for token authentication
export function tokenAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    if (!token) {
        res.status(401).json({ error: 'Authentication token required' });
        return;
    }
    const payload = verifyToken(token);
    if (!payload) {
        res.status(403).json({ error: 'Invalid or expired token' });
        return;
    }
    // Store token payload in request for later use
    req.user = payload;
    next();
}
// Express middleware for session authentication
export function sessionAuth(req, res, next) {
    const sessionId = req.query.sessionId || req.cookies?.sessionId;
    if (!sessionId) {
        res.status(401).json({ error: 'Session ID required' });
        return;
    }
    if (!isSessionValid(sessionId)) {
        res.status(403).json({ error: 'Invalid or expired session' });
        return;
    }
    // Update session activity
    updateSessionActivity(sessionId);
    // Store session info in request for later use
    req.session = {
        id: sessionId,
        ...getSessionInfo(sessionId)
    };
    next();
}
//# sourceMappingURL=auth.js.map