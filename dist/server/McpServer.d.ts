<<<<<<< Updated upstream
/// <reference types="node" />
import { EventEmitter } from 'events';
=======
import { Logger, McpTransport, RunnableTool } from '../sdk';
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
export interface McpServerOptions {
    name: string;
    version: string;
    logger?: any;
}
/**
 * Simple MCP Server implementation
 * Handles connections, tools, and message dispatching
 */
<<<<<<< Updated upstream
export declare class McpServer extends EventEmitter {
    private _name;
    private _version;
    private _tools;
    private _transports;
    private _logger;
    /**
     * Create a new MCP server
     * @param options Server configuration options
     */
=======
export declare class McpServer {
    private options;
    private registry;
    private transports;
    private toolHandlers;
    private resourceHandlers;
    private promptHandlers;
>>>>>>> Stashed changes
    constructor(options: McpServerOptions);
    /**
     * Get server name
     */
    get name(): string;
    /**
     * Get server version
     */
    get version(): string;
    /**
     * Connect a transport to the server
     * @param transport Transport implementation
     */
    connect(transport: Transport): Promise<void>;
    /**
     * Handle incoming messages
     * @param transport Source transport
     * @param message Message data
     */
<<<<<<< Updated upstream
    private _handleMessage;
=======
    tool(name: string, description: string, parameters: any, handler: (params: any, context: any) => Promise<any>): RunnableTool;
    /**
     * 서버에 리소스를 등록합니다
     */
    resource(name: string, description: string, handler: (params: any, context: any) => Promise<any>): void;
    /**
     * 서버에 프롬프트를 등록합니다
     */
    prompt(name: string, description: string, handler: (params: any, context: any) => Promise<any>): void;
>>>>>>> Stashed changes
    /**
     * Handle tool call messages
     * @param transport Source transport
     * @param message Tool call message
     */
    private _handleToolCall;
    /**
     * Register a tool
     * @param name Tool name
     * @param callback Tool implementation
     */
    tool(name: string, callback: ToolCallback): void;
    /**
     * Tool registry interface
     */
    get tools(): {
        add: (name: string, callback: ToolCallback) => void;
    };
    /**
     * Disconnect a transport
     * @param sessionId Session ID to disconnect
     */
    disconnect(sessionId: string): Promise<void>;
    /**
     * Disconnect all transports
     */
    disconnectAll(): Promise<void>;
}
