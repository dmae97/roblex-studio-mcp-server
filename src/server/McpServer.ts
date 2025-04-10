import { 
    DefaultRegistry, 
    Logger, 
    McpRegistry, 
    McpRequestType, 
    McpResponse, 
    McpTransport, 
    RunnableTool,
    ToolCallHandler,
    Schema
} from '../sdk';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * McpServer 옵션 인터페이스
 */
export interface McpServerOptions {
    name: string;
    version: string;
    logger?: Logger;
}

/**
 * Roblex Studio MCP Server 구현
 */
export class McpServer {
    private options: McpServerOptions;
    private registry: McpRegistry;
    private transports: Map<string, McpTransport>;
    private toolHandlers: Map<string, ToolCallHandler>;
    
    constructor(options: McpServerOptions) {
        this.options = options;
        this.registry = new DefaultRegistry();
        this.transports = new Map();
        this.toolHandlers = new Map();
        
        const log = options.logger || logger;
        log.info(`MCP Server initialized: ${options.name} v${options.version}`);
    }
    
    /**
     * 트랜스포트를 서버에 연결합니다
     */
    async connect(transport: McpTransport): Promise<void> {
        const transportId = transport.sessionId || uuidv4();
        this.transports.set(transportId, transport);
        
        // 트랜스포트에 메시지 핸들러 등록
        transport.onMessage(async (request) => {
            return this.handleRequest(request, transport);
        });
        
        logger.info(`Transport connected to MCP Server: ${transportId}`);
    }
    
    /**
     * MCP 요청을 처리합니다
     */
    private async handleRequest(request: any, transport: McpTransport): Promise<McpResponse> {
        try {
            logger.debug(`Received request: ${JSON.stringify(request)}`);
            
            if (request.type === McpRequestType.ToolCallRequest) {
                return this.handleToolCallRequest(request, transport);
            }
            
            return {
                type: 'error',
                error: {
                    message: `Unsupported request type: ${request.type}`,
                    code: 'UNSUPPORTED_REQUEST_TYPE'
                }
            };
        } catch (error: any) {
            logger.error(`Error handling request: ${error.message}`);
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
    private async handleToolCallRequest(request: any, transport: McpTransport): Promise<McpResponse> {
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
        } catch (error: any) {
            logger.error(`Error executing tool ${name}: ${error.message}`);
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
    tool(name: string, schema: Schema, handler: ToolCallHandler): RunnableTool {
        this.toolHandlers.set(name, handler);
        this.registry.registerTool(name, schema);
        
        logger.info(`Registered tool: ${name}`);
        
        return {
            name,
            schema,
            run: handler
        };
    }
    
    /**
     * 모든 연결된 트랜스포트를 닫습니다
     */
    async close(): Promise<void> {
        logger.info('Closing MCP Server...');
        
        for (const transport of this.transports.values()) {
            try {
                // 트랜스포트에 close 메서드가 있으면 호출
                if (typeof transport.close === 'function') {
                    await transport.close();
                }
            } catch (error) {
                logger.error(`Error closing transport: ${error}`);
            }
        }
        
        this.transports.clear();
        logger.info('MCP Server closed');
    }
}