/// <reference types="node" resolution-mode="require"/>
import { EventEmitter } from 'events';
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
    private _handleMessage;
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
