"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpServerFactory = void 0;
const McpServer_js_1 = require("./McpServer.js");
const SequentialMcpServer_js_1 = require("./SequentialMcpServer.js");
const logger_js_1 = require("../utils/logger.js");
/**
 * Factory for creating MCP servers
 */
class McpServerFactory {
    /**
     * Create a standard MCP server
     * @param options Server configuration options
     * @returns Standard MCP server instance
     */
    static createStandard(options) {
        logger_js_1.logger.info(`Creating standard MCP server: ${options.name}`);
        return new McpServer_js_1.McpServer(options);
    }
    /**
     * Create a sequential MCP server
     * @param options Server configuration options
     * @param concurrency Number of concurrent tasks to process (default: 1)
     * @returns Sequential MCP server instance
     */
    static createSequential(options, concurrency = 1) {
        logger_js_1.logger.info(`Creating sequential MCP server: ${options.name} with concurrency ${concurrency}`);
        return new SequentialMcpServer_js_1.SequentialMcpServer(options, concurrency);
    }
    /**
     * Create an MCP server of the specified type
     * @param type Type of server to create ('standard' or 'sequential')
     * @param options Server configuration options
     * @param concurrency Number of concurrent tasks for sequential server (default: 1)
     * @returns MCP server instance of the specified type
     */
    static create(type, options, concurrency = 1) {
        switch (type) {
            case 'standard':
                return this.createStandard(options);
            case 'sequential':
                return this.createSequential(options, concurrency);
            default:
                logger_js_1.logger.warn(`Unknown server type '${type}', defaulting to standard`);
                return this.createStandard(options);
        }
    }
}
exports.McpServerFactory = McpServerFactory;
//# sourceMappingURL=McpServerFactory.js.map