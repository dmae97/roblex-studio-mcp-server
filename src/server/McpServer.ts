<<<<<<< Updated upstream
import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';
=======
import { 
    DefaultRegistry, 
    Logger, 
    McpRegistry, 
    McpRequestType, 
    McpResponse, 
    McpTransport, 
    RunnableTool,
    ToolCallHandler,
    Schema,
    McpRequest,
    McpResponseType
} from '../sdk';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
>>>>>>> Stashed changes

/**
 * Type for a tool callback function
 */
export type ToolCallback = (args: any) => Promise<any> | any;

/**
 * Transport interface for MCP communication
 */
export interface Transport {
  sessionId: string;
  send(message: any): Promise<void>;
  onMessage(handler: (message: any) => Promise<void>): void;
  disconnect(): Promise<void>;
}

/**
 * Server configuration options
 */
<<<<<<< Updated upstream
export interface McpServerOptions {
  name: string;
  version: string;
  logger?: any;
}

/**
 * Simple MCP Server implementation
 * Handles connections, tools, and message dispatching
 */
export class McpServer extends EventEmitter {
  private _name: string;
  private _version: string;
  private _tools: Map<string, ToolCallback>;
  private _transports: Map<string, Transport>;
  private _logger: any;
  
  /**
   * Create a new MCP server
   * @param options Server configuration options
   */
  constructor(options: McpServerOptions) {
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
  get name(): string {
    return this._name;
  }
  
  /**
   * Get server version
   */
  get version(): string {
    return this._version;
  }
  
  /**
   * Connect a transport to the server
   * @param transport Transport implementation
   */
  async connect(transport: Transport): Promise<void> {
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
  private async _handleMessage(transport: Transport, message: any): Promise<void> {
    try {
      this._logger.debug(`Received message from ${transport.sessionId}`, message);
      
      if (message.type === 'tool_call') {
        await this._handleToolCall(transport, message);
      } else {
        this._logger.warn(`Unknown message type: ${message.type}`);
        await transport.send({
          type: 'error',
          data: {
            message: `Unknown message type: ${message.type}`
          }
=======
export class McpServer {
    private options: McpServerOptions;
    private registry: McpRegistry;
    private transports: Map<string, McpTransport>;
    private toolHandlers: Map<string, { 
        handler: (params: any, context: any) => Promise<any>; 
        description: string; 
        parameters: any;
    }>;
    private resourceHandlers: Map<string, { 
        handler: (params: any, context: any) => Promise<any>; 
        description: string; 
    }>;
    private promptHandlers: Map<string, { 
        handler: (params: any, context: any) => Promise<any>; 
        description: string; 
    }>;
    
    constructor(options: McpServerOptions) {
        this.options = options;
        this.registry = new DefaultRegistry();
        this.transports = new Map();
        this.toolHandlers = new Map();
        this.resourceHandlers = new Map();
        this.promptHandlers = new Map();
        
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
        transport.onMessage(async (request: McpRequest) => {
            return await this.handleRequest(request);
>>>>>>> Stashed changes
        });
      }
    } catch (error) {
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
  private async _handleToolCall(transport: Transport, message: any): Promise<void> {
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
    
<<<<<<< Updated upstream
    try {
      const tool = this._tools.get(toolName)!;
      const result = await tool(args);
      
      await transport.send({
        type: 'tool_result',
        data: {
          toolName,
          success: true,
          result
=======
    /**
     * MCP 요청을 처리합니다
     */
    private async handleRequest(request: McpRequest): Promise<McpResponse> {
        try {
            logger.debug(`Received request: ${JSON.stringify(request)}`);
            
            if (request.type === McpRequestType.ToolCallRequest) {
                return await this.handleToolCallRequest(request);
            }
            
            return {
                type: 'error',
                error: {
                    message: `Unsupported request type: ${request.type}`,
                    code: 'UNSUPPORTED_REQUEST_TYPE' as string
                }
            };
        } catch (error: any) {
            logger.error(`Error handling request: ${error.message}`);
            return {
                type: 'error',
                error: {
                    message: error.message,
                    code: 'INTERNAL_SERVER_ERROR' as string
                }
            };
>>>>>>> Stashed changes
        }
      });
    } catch (error) {
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
  tool(name: string, callback: ToolCallback): void {
    if (this._tools.has(name)) {
      throw new Error(`Tool already registered: ${name}`);
    }
    
<<<<<<< Updated upstream
    this._tools.set(name, callback);
    this._logger.info(`Tool registered: ${name}`);
  }
  
  /**
   * Tool registry interface
   */
  get tools() {
    return {
      add: (name: string, callback: ToolCallback) => this.tool(name, callback)
    };
  }
  
  /**
   * Disconnect a transport
   * @param sessionId Session ID to disconnect
   */
  async disconnect(sessionId: string): Promise<void> {
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
  async disconnectAll(): Promise<void> {
    const sessionIds = Array.from(this._transports.keys());
    
    for (const sessionId of sessionIds) {
      await this.disconnect(sessionId);
    }
    
    this._logger.info('All transports disconnected');
  }
} 
=======
    /**
     * 도구 호출 요청을 처리합니다
     */
    private async handleToolCallRequest(request: McpRequest): Promise<McpResponse> {
        const { toolCall } = request;
        
        if (!toolCall) {
            return {
                type: 'error',
                error: {
                    message: 'Tool call request is missing toolCall field',
                    code: 'INVALID_REQUEST' as string
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
                    code: 'TOOL_NOT_FOUND' as string
                }
            };
        }
        
        try {
            const result = await handler.handler(parameters, { request });
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
                    code: 'TOOL_EXECUTION_ERROR' as string
                }
            };
        }
    }
    
    /**
     * 서버에 도구를 등록합니다
     */
    tool(name: string, description: string, parameters: any, handler: (params: any, context: any) => Promise<any>): RunnableTool {
        // 도구 핸들러 등록
        this.toolHandlers.set(name, { handler, description, parameters });
        
        // 도구 스키마 등록
        const schema: Schema = {
            type: 'object',
            properties: parameters
        };
        this.registry.registerTool(name, schema);
        
        // 로그 출력
        logger.info(`Registered tool: ${name}`);
        
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
    resource(name: string, description: string, handler: (params: any, context: any) => Promise<any>): void {
        // 리소스 핸들러 등록
        this.resourceHandlers.set(name, { handler, description });
        
        // 로그 출력
        logger.info(`Registered resource: ${name}`);
    }
    
    /**
     * 서버에 프롬프트를 등록합니다
     */
    prompt(name: string, description: string, handler: (params: any, context: any) => Promise<any>): void {
        // 프롬프트 핸들러 등록
        this.promptHandlers.set(name, { handler, description });
        
        // 로그 출력
        logger.info(`Registered prompt: ${name}`);
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
>>>>>>> Stashed changes
