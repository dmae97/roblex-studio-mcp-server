/**
 * Simple logging utility for Roblex Studio MCP Server
 */

// Log levels
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4
}

// Get log level from environment or default to INFO
const LOG_LEVEL = process.env.LOG_LEVEL ? 
    (LogLevel[process.env.LOG_LEVEL as keyof typeof LogLevel] || LogLevel.INFO) : 
    LogLevel.INFO;

// Helper function to get timestamp
const getTimestamp = (): string => {
    return new Date().toISOString();
};

// Logger implementation
export const logger = {
    debug: (message: string): void => {
        if (LOG_LEVEL <= LogLevel.DEBUG) {
            console.debug(`[${getTimestamp()}] [DEBUG] ${message}`);
        }
    },
    
    info: (message: string): void => {
        if (LOG_LEVEL <= LogLevel.INFO) {
            console.info(`[${getTimestamp()}] [INFO] ${message}`);
        }
    },
    
    warn: (message: string): void => {
        if (LOG_LEVEL <= LogLevel.WARN) {
            console.warn(`[${getTimestamp()}] [WARN] ${message}`);
        }
    },
    
    error: (message: string): void => {
        if (LOG_LEVEL <= LogLevel.ERROR) {
            console.error(`[${getTimestamp()}] [ERROR] ${message}`);
        }
    }
}; 