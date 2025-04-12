import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';
import { McpServer as SdkMcpServer } from '@modelcontextprotocol/sdk';

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
export interface McpServerOptions {
  name: string;
  version: string;
  logger?: any;
}

/**
 * Simple MCP Server implementation
 * Handles connections, tools, and message dispatching
 * 
 * This is a facade that wraps the SDK McpServer to provide compatibility
 * and our own extensions
 */
export class McpServer extends EventEmitter {
  private _name: string;
  private _version: string;
  private _tools: Map<string, ToolCallback>;
  private _transports: Map<string, Transport>;
  private _logger: any;
  
  // SDK compatibility properties
  public server: any;
  public _registeredResources: any[] = [];
  public _registeredResourceTemplates: any[] = [];
  public _registeredTools: any[] = [];
  public _registeredPrompts: any[] = [];
  public _registeredTooltips: any[] = [];
  
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
    
    // Initialize for SDK compatibility
    this.server = {};
    
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
    
    try {
      const tool = this._tools.get(toolName)!;
      const result = await tool(args);
      
      await transport.send({
        type: 'tool_result',
        data: {
          toolName,
          success: true,
          result
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
  
  // SDK compatibility methods
  registerResource(resource: any): void {
    this._registeredResources.push(resource);
    this._logger.info(`Resource registered: ${resource.name || 'unnamed'}`);
  }
  
  registerResourceTemplate(template: any): void {
    this._registeredResourceTemplates.push(template);
    this._logger.info(`Resource template registered: ${template.name || 'unnamed'}`);
  }
  
  registerTool(tool: any): void {
    this._registeredTools.push(tool);
    this._logger.info(`SDK Tool registered: ${tool.name || 'unnamed'}`);
    
    // Also register with our system
    this.tool(tool.name, tool.execute || (() => Promise.resolve({})));
  }
  
  registerPrompt(prompt: any): void {
    this._registeredPrompts.push(prompt);
    this._logger.info(`Prompt registered: ${prompt.name || 'unnamed'}`);
  }
  
  registerTooltip(tooltip: any): void {
    this._registeredTooltips.push(tooltip);
    this._logger.info(`Tooltip registered: ${tooltip.name || 'unnamed'}`);
  }
}