"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpServer = void 0;
const sdk_1 = require("../sdk");
const logger_1 = require("../utils/logger");
const uuid_1 = require("uuid");
/**
 * Roblex Studio MCP Server 구현
 */
class McpServer {
    options;
    registry;
    transports;
    toolHandlers;
    constructor(options) {
        this.options = options;
        this.registry = new sdk_1.DefaultRegistry();
        this.transports = new Map();
        this.toolHandlers = new Map();
        const log = options.logger || logger_1.logger;
        log.info(`MCP Server initialized: ${options.name} v${options.version}`);
    }
    /**
     * 트랜스포트를 서버에 연결합니다
     */
    async connect(transport) {
        const transportId = transport.sessionId || (0, uuid_1.v4)();
        this.transports.set(transportId, transport);
        // 트랜스포트에 메시지 핸들러 등록
        transport.onMessage(async (request) => {
            return this.handleRequest(request, transport);
        });
        logger_1.logger.info(`Transport connected to MCP Server: ${transportId}`);
    }
    /**
     * MCP 요청을 처리합니다
     */
    async handleRequest(request, transport) {
        try {
            logger_1.logger.debug(`Received request: ${JSON.stringify(request)}`);
            if (request.type === sdk_1.McpRequestType.ToolCallRequest) {
                return this.handleToolCallRequest(request, transport);
            }
            return {
                type: 'error',
                error: {
                    message: `Unsupported request type: ${request.type}`,
                    code: 'UNSUPPORTED_REQUEST_TYPE'
                }
            };
        }
        catch (error) {
            logger_1.logger.error(`Error handling request: ${error.message}`);
            return {
                type: 'error',
                error: {
                    message: error.message,
                    code: 'INTERNAL_SERVER_ERROR'
                }
            };
        }
    }
    /**
     * 도구 호출 요청을 처리합니다
     */
    async handleToolCallRequest(request, transport) {
        const { toolCall } = request;
        if (!toolCall) {
            return {
                type: 'error',
                error: {
                    message: 'Tool call request is missing toolCall field',
                    code: 'INVALID_REQUEST'
                }
            };
        }
        const { name, parameters } = toolCall;
        const handler = this.toolHandlers.get(name);
        if (!handler) {
            return {
                type: 'error',
                error: {
                    message: `Tool not found: ${name}`,
                    code: 'TOOL_NOT_FOUND'
                }
            };
        }
        try {
            const result = await handler(parameters);
            return {
                type: 'success',
                result
            };
        }
        catch (error) {
            logger_1.logger.error(`Error executing tool ${name}: ${error.message}`);
            return {
                type: 'error',
                error: {
                    message: error.message || 'Tool execution failed',
                    code: 'TOOL_EXECUTION_ERROR'
                }
            };
        }
    }
    /**
     * 서버에 도구를 등록합니다
     */
    tool(name, schema, handler) {
        this.toolHandlers.set(name, handler);
        this.registry.registerTool(name, schema);
        logger_1.logger.info(`Registered tool: ${name}`);
        return {
            name,
            schema,
            run: handler
        };
    }
    /**
     * 모든 연결된 트랜스포트를 닫습니다
     */
    async close() {
        logger_1.logger.info('Closing MCP Server...');
        for (const transport of this.transports.values()) {
            try {
                // 트랜스포트에 close 메서드가 있으면 호출
                if (typeof transport.close === 'function') {
                    await transport.close();
                }
            }
            catch (error) {
                logger_1.logger.error(`Error closing transport: ${error}`);
            }
        }
        this.transports.clear();
        logger_1.logger.info('MCP Server closed');
    }
}
exports.McpServer = McpServer;
//# sourceMappingURL=McpServer.js.map