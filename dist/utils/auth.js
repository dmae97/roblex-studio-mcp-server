"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionAuth = exports.tokenAuth = exports.apiKeyAuth = exports.init = exports.cleanupSessions = exports.revokeSession = exports.getSessionInfo = exports.isSessionValid = exports.updateSessionActivity = exports.registerSession = exports.createHash = exports.verifyApiKey = exports.verifyToken = exports.createToken = exports.generateSessionId = exports.generateToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const logger_js_1 = require("./logger.js");
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
    logger_js_1.logger.info(`Loaded ${Object.keys(API_KEYS).length} API keys`);
}
// Generate a random token
function generateToken(length = 32) {
    return crypto_1.default.randomBytes(length).toString('hex');
}
exports.generateToken = generateToken;
// Generate a session ID
function generateSessionId(prefix = 'session') {
    return `${prefix}_${Date.now()}_${generateToken(8)}`;
}
exports.generateSessionId = generateSessionId;
// Create a JWT token
function createToken(payload, expiresIn = TOKEN_EXPIRATION) {
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
    const signature = crypto_1.default
        .createHmac('sha256', JWT_SECRET)
        .update(`${headerBase64}.${payloadBase64}`)
        .digest('base64url');
    return `${headerBase64}.${payloadBase64}.${signature}`;
}
exports.createToken = createToken;
// Verify a JWT token
function verifyToken(token) {
    try {
        const [headerBase64, payloadBase64, signature] = token.split('.');
        const expectedSignature = crypto_1.default
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
        logger_js_1.logger.error(`Error verifying token: ${error instanceof Error ? error.message : String(error)}`);
        return null;
    }
}
exports.verifyToken = verifyToken;
// Verify an API key
function verifyApiKey(apiKey) {
    if (API_KEYS[apiKey] && API_KEYS[apiKey].enabled) {
        return {
            valid: true,
            name: API_KEYS[apiKey].name,
            role: API_KEYS[apiKey].role
        };
    }
    return { valid: false };
}
exports.verifyApiKey = verifyApiKey;
// Create a hash of a string
function createHash(data) {
    return crypto_1.default.createHash('sha256').update(data).digest('hex');
}
exports.createHash = createHash;
// Active sessions store
const activeSessions = {};
// Register a new session
function registerSession(sessionId, userId, role, ipAddress) {
    if (!activeSessions[sessionId]) {
        activeSessions[sessionId] = {
            userId,
            role,
            ipAddress: ipAddress || 'unknown',
            createdAt: Date.now(),
            lastActivity: Date.now()
        };
        logger_js_1.logger.info(`Session registered: ${sessionId} (${userId}, ${role})`);
    }
    else {
        updateSessionActivity(sessionId);
    }
}
exports.registerSession = registerSession;
// Update session activity
function updateSessionActivity(sessionId) {
    if (activeSessions[sessionId]) {
        activeSessions[sessionId].lastActivity = Date.now();
    }
}
exports.updateSessionActivity = updateSessionActivity;
// Check if a session is valid
function isSessionValid(sessionId) {
    return !!activeSessions[sessionId];
}
exports.isSessionValid = isSessionValid;
// Get session info
function getSessionInfo(sessionId) {
    return activeSessions[sessionId];
}
exports.getSessionInfo = getSessionInfo;
// Revoke a session
function revokeSession(sessionId) {
    if (activeSessions[sessionId]) {
        logger_js_1.logger.debug(`Revoking session ${sessionId} for user ${activeSessions[sessionId].userId}`);
        delete activeSessions[sessionId];
    }
}
exports.revokeSession = revokeSession;
// Clean up expired sessions
function cleanupSessions(maxAgeMs = 3600000) {
    const now = Date.now();
    const expiredSessions = Object.keys(activeSessions).filter(sessionId => (now - activeSessions[sessionId].lastActivity) > maxAgeMs);
    expiredSessions.forEach(sessionId => {
        logger_js_1.logger.debug(`Session ${sessionId} expired, revoking`);
        revokeSession(sessionId);
    });
    logger_js_1.logger.info(`Cleaned up ${expiredSessions.length} expired sessions`);
}
exports.cleanupSessions = cleanupSessions;
// Initialize authentication system
function init() {
    loadApiKeys();
    // Set up session cleanup interval
    setInterval(() => cleanupSessions(), 60000); // Clean up every minute
    logger_js_1.logger.info('Authentication system initialized');
}
exports.init = init;
// Express middleware for API key authentication
function apiKeyAuth(req, res, next) {
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
exports.apiKeyAuth = apiKeyAuth;
// Express middleware for token authentication
function tokenAuth(req, res, next) {
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
exports.tokenAuth = tokenAuth;
// Express middleware for session authentication
function sessionAuth(req, res, next) {
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
exports.sessionAuth = sessionAuth;
//# sourceMappingURL=auth.js.map