"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpServer = void 0;
const events_1 = require("events");
/**
 * Simple MCP Server implementation
 * Handles connections, tools, and message dispatching
 */
<<<<<<< Updated upstream
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
=======
class McpServer {
    options;
    registry;
    transports;
    toolHandlers;
    resourceHandlers;
    promptHandlers;
    constructor(options) {
        this.options = options;
        this.registry = new sdk_1.DefaultRegistry();
        this.transports = new Map();
        this.toolHandlers = new Map();
        this.resourceHandlers = new Map();
        this.promptHandlers = new Map();
        const log = options.logger || logger_1.logger;
        log.info(`MCP Server initialized: ${options.name} v${options.version}`);
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
        const transportId = transport.sessionId || (0, uuid_1.v4)();
        this.transports.set(transportId, transport);
        // 트랜스포트에 메시지 핸들러 등록
        transport.onMessage(async (request) => {
            return await this.handleRequest(request);
        });
        logger_1.logger.info(`Transport connected to MCP Server: ${transportId}`);
    }
    /**
     * MCP 요청을 처리합니다
     */
    async handleRequest(request) {
        try {
            logger_1.logger.debug(`Received request: ${JSON.stringify(request)}`);
            if (request.type === sdk_1.McpRequestType.ToolCallRequest) {
                return await this.handleToolCallRequest(request);
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
    async handleToolCallRequest(request) {
        const { toolCall } = request;
        if (!toolCall) {
            return {
                type: 'error',
                error: {
                    message: 'Tool call request is missing toolCall field',
                    code: 'INVALID_REQUEST'
>>>>>>> Stashed changes
                }
            });
            return;
        }
        try {
<<<<<<< Updated upstream
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
=======
            const result = await handler.handler(parameters, { request });
            return {
                type: 'success',
                result
            };
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
    tool(name, description, parameters, handler) {
        // 도구 핸들러 등록
        this.toolHandlers.set(name, { handler, description, parameters });
        // 도구 스키마 등록
        const schema = {
            type: 'object',
            properties: parameters
        };
        this.registry.registerTool(name, schema);
        // 로그 출력
        logger_1.logger.info(`Registered tool: ${name}`);
        // 실행 가능한 도구 객체 반환
        return {
            name,
            schema,
            run: (params) => handler(params, {})
        };
    }
    /**
     * 서버에 리소스를 등록합니다
     */
    resource(name, description, handler) {
        // 리소스 핸들러 등록
        this.resourceHandlers.set(name, { handler, description });
        // 로그 출력
        logger_1.logger.info(`Registered resource: ${name}`);
    }
    /**
     * 서버에 프롬프트를 등록합니다
     */
    prompt(name, description, handler) {
        // 프롬프트 핸들러 등록
        this.promptHandlers.set(name, { handler, description });
        // 로그 출력
        logger_1.logger.info(`Registered prompt: ${name}`);
    }
    /**
     * 모든 연결된 트랜스포트를 닫습니다
>>>>>>> Stashed changes
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