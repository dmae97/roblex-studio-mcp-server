"use strict";
/**
 * Simple logging utility for Roblex Studio MCP Server
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LogLevel = void 0;
// Log levels
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["NONE"] = 4] = "NONE";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
// Get log level from environment or default to INFO
const LOG_LEVEL = process.env.LOG_LEVEL ?
    (LogLevel[process.env.LOG_LEVEL] || LogLevel.INFO) :
    LogLevel.INFO;
// Helper function to get timestamp
const getTimestamp = () => {
    return new Date().toISOString();
};
// Logger implementation
exports.logger = {
    debug: (message) => {
        if (LOG_LEVEL <= LogLevel.DEBUG) {
            console.debug(`[${getTimestamp()}] [DEBUG] ${message}`);
        }
    },
    info: (message) => {
        if (LOG_LEVEL <= LogLevel.INFO) {
            console.info(`[${getTimestamp()}] [INFO] ${message}`);
        }
    },
    warn: (message) => {
        if (LOG_LEVEL <= LogLevel.WARN) {
            console.warn(`[${getTimestamp()}] [WARN] ${message}`);
        }
    },
    error: (message) => {
        if (LOG_LEVEL <= LogLevel.ERROR) {
            console.error(`[${getTimestamp()}] [ERROR] ${message}`);
        }
    }
};
//# sourceMappingURL=logger.js.map