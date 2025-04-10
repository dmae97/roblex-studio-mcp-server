"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = init;
exports.verifyApiKey = verifyApiKey;
exports.generateSessionId = generateSessionId;
exports.registerSession = registerSession;
exports.isSessionValid = isSessionValid;
exports.updateSessionActivity = updateSessionActivity;
exports.revokeSession = revokeSession;
exports.createToken = createToken;
exports.apiKeyAuth = apiKeyAuth;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("./logger");
// Store for API keys, sessions and tokens
const apiKeys = new Map();
const sessions = new Map();
// Session timeout in seconds (default: 1 hour)
const SESSION_TIMEOUT = Number(process.env.SESSION_TIMEOUT || 3600);
/**
 * Initialize authentication system
 */
function init() {
    logger_1.logger.info('Initializing authentication system');
    // Load API keys from environment
    if (process.env.API_KEYS) {
        try {
            const keys = process.env.API_KEYS.split(',');
            for (const keyPair of keys) {
                const [key, info] = keyPair.split(':');
                if (!key || !info)
                    continue;
                const [name, role] = info.split(';');
                if (!name)
                    continue;
                apiKeys.set(key.trim(), {
                    name: name.trim(),
                    role: role?.trim() || 'user'
                });
                logger_1.logger.info(`Registered API key for: ${name}`);
            }
        }
        catch (error) {
            logger_1.logger.error(`Error loading API keys: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
/**
 * Verify an API key
 */
function verifyApiKey(apiKey) {
    const keyInfo = apiKeys.get(apiKey);
    if (!keyInfo) {
        logger_1.logger.warn(`Invalid API key attempt`);
        return { valid: false };
    }
    logger_1.logger.info(`API key verified for: ${keyInfo.name}`);
    return { valid: true, name: keyInfo.name, role: keyInfo.role };
}
/**
 * Generate a session ID
 */
function generateSessionId(prefix = 'session') {
    return `${prefix}_${crypto_1.default.randomUUID()}`;
}
/**
 * Register a new session
 */
function registerSession(sessionId, userId, role, ip) {
    sessions.set(sessionId, {
        userId,
        role,
        ip,
        lastActivity: Date.now()
    });
    logger_1.logger.info(`Session registered: ${sessionId} for ${userId}`);
}
/**
 * Check if a session is valid
 */
function isSessionValid(sessionId) {
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
function updateSessionActivity(sessionId) {
    const session = sessions.get(sessionId);
    if (session) {
        session.lastActivity = Date.now();
    }
}
/**
 * Revoke a session
 */
function revokeSession(sessionId) {
    if (sessions.has(sessionId)) {
        logger_1.logger.info(`Session revoked: ${sessionId}`);
        sessions.delete(sessionId);
    }
}
/**
 * Create an authentication token
 */
function createToken(payload) {
    // In a production system, use a proper JWT library
    // This is a simplified implementation
    const tokenData = Buffer.from(JSON.stringify(payload)).toString('base64');
    return tokenData;
}
/**
 * Authentication middleware for Express
 */
function apiKeyAuth(req, res, next) {
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
//# sourceMappingURL=auth.js.map