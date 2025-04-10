/**
 * Initialize authentication system
 */
export declare function init(): void;
/**
 * Verify an API key
 */
export declare function verifyApiKey(apiKey: string): {
    valid: boolean;
    name?: string;
    role?: string;
};
/**
 * Generate a session ID
 */
export declare function generateSessionId(prefix?: string): string;
/**
 * Register a new session
 */
export declare function registerSession(sessionId: string, userId: string, role: string, ip: string): void;
/**
 * Check if a session is valid
 */
export declare function isSessionValid(sessionId: string): boolean;
/**
 * Update session activity timestamp
 */
export declare function updateSessionActivity(sessionId: string): void;
/**
 * Revoke a session
 */
export declare function revokeSession(sessionId: string): void;
/**
 * Create an authentication token
 */
export declare function createToken(payload: Record<string, any>): string;
/**
 * Authentication middleware for Express
 */
export declare function apiKeyAuth(req: any, res: any, next: () => void): void;
