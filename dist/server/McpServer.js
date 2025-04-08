"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpServer = void 0;
const events_1 = require("events");
/**
 * Simple MCP Server implementation
 * Handles connections, tools, and message dispatching
 */
class McpServer extends events_1.EventEmitter {
    _name;
    _version;
    _tools;
    _transports;
    _logger;
    /**
     * Create a new MCP server
     * @param options Server configuration options
     */
    constructor(options) {
        super();
        this._name = options.name || 'MCP Server';
        this._version = options.version || '1.0.0';
        this._tools = new Map();
        this._transports = new Map();
        this._logger = options.logger || console;
        this._logger.info(`MCP Server created: ${this._name} v${this._version}`);
    }
    /**
     * Get server name
     */
    get name() {
        return this._name;
    }
    /**
     * Get server version
     */
    get version() {
        return this._version;
    }
    /**
     * Connect a transport to the server
     * @param transport Transport implementation
     */
    async connect(transport) {
        this._transports.set(transport.sessionId, transport);
        // Set up message handler
        transport.onMessage(async (message) => {
            await this._handleMessage(transport, message);
        });
        this._logger.info(`Transport connected: ${transport.sessionId}`);
        this.emit('connect', transport);
        // Send server info as initial message
        await transport.send({
            type: 'server_info',
            data: {
                name: this._name,
                version: this._version,
                tools: Array.from(this._tools.keys())
            }
        });
    }
    /**
     * Handle incoming messages
     * @param transport Source transport
     * @param message Message data
     */
    async _handleMessage(transport, message) {
        try {
            this._logger.debug(`Received message from ${transport.sessionId}`, message);
            if (message.type === 'tool_call') {
                await this._handleToolCall(transport, message);
            }
            else {
                this._logger.warn(`Unknown message type: ${message.type}`);
                await transport.send({
                    type: 'error',
                    data: {
                        message: `Unknown message type: ${message.type}`
                    }
                });
            }
        }
        catch (error) {
            this._logger.error(`Error handling message: ${error instanceof Error ? error.message : String(error)}`);
            await transport.send({
                type: 'error',
                data: {
                    message: 'Error processing message',
                    details: error instanceof Error ? error.message : String(error)
                }
            });
        }
    }
    /**
     * Handle tool call messages
     * @param transport Source transport
     * @param message Tool call message
     */
    async _handleToolCall(transport, message) {
        const { toolName, args } = message.data;
        if (!this._tools.has(toolName)) {
            this._logger.warn(`Tool not found: ${toolName}`);
            await transport.send({
                type: 'tool_result',
                data: {
                    toolName,
                    success: false,
                    error: `Tool not found: ${toolName}`
                }
            });
            return;
        }
        try {
            const tool = this._tools.get(toolName);
            const result = await tool(args);
            await transport.send({
                type: 'tool_result',
                data: {
                    toolName,
                    success: true,
                    result
                }
            });
        }
        catch (error) {
            this._logger.error(`Error executing tool ${toolName}: ${error instanceof Error ? error.message : String(error)}`);
            await transport.send({
                type: 'tool_result',
                data: {
                    toolName,
                    success: false,
                    error: error instanceof Error ? error.message : String(error)
                }
            });
        }
    }
    /**
     * Register a tool
     * @param name Tool name
     * @param callback Tool implementation
     */
    tool(name, callback) {
        if (this._tools.has(name)) {
            throw new Error(`Tool already registered: ${name}`);
        }
        this._tools.set(name, callback);
        this._logger.info(`Tool registered: ${name}`);
    }
    /**
     * Tool registry interface
     */
    get tools() {
        return {
            add: (name, callback) => this.tool(name, callback)
        };
    }
    /**
     * Disconnect a transport
     * @param sessionId Session ID to disconnect
     */
    async disconnect(sessionId) {
        const transport = this._transports.get(sessionId);
        if (transport) {
            await transport.disconnect();
            this._transports.delete(sessionId);
            this._logger.info(`Transport disconnected: ${sessionId}`);
            this.emit('disconnect', sessionId);
        }
    }
    /**
     * Disconnect all transports
     */
    async disconnectAll() {
        const sessionIds = Array.from(this._transports.keys());
        for (const sessionId of sessionIds) {
            await this.disconnect(sessionId);
        }
        this._logger.info('All transports disconnected');
    }
}
exports.McpServer = McpServer;
//# sourceMappingURL=McpServer.js.map