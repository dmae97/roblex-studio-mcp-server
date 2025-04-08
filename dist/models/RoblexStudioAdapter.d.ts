import { RoblexContext, RoblexProtocol } from './index.js';
/**
 * Roblox Studio adapter for MCP connection
 * Handles communication between Roblox Studio and the MCP server
 */
export declare class RoblexStudioAdapter {
    private _protocol;
    private _context;
    private _connectionId;
    private _isConnected;
    private _lastPingTime;
    private _pingInterval;
    /**
     * Create a new Roblox Studio adapter
     * @param connectionId Unique identifier for this connection
     * @param useGlobal Whether to use the global protocol and context (default: true)
     */
    constructor(connectionId: string, useGlobal?: boolean);
    /**
     * Get the connection ID
     */
    get connectionId(): string;
    /**
     * Get the connection status
     */
    get isConnected(): boolean;
    /**
     * Get the protocol instance
     */
    get protocol(): RoblexProtocol;
    /**
     * Get the context instance
     */
    get context(): RoblexContext;
    /**
     * Initialize the connection with Roblox Studio
     */
    connect(): void;
    /**
     * Disconnect from Roblox Studio
     */
    disconnect(): void;
    /**
     * Handle incoming message from Roblox Studio
     * @param messageType Type of message
     * @param data Message data
     * @returns Response data
     */
    handleMessage(messageType: string, data: any): Promise<any>;
    /**
     * Send a message to Roblox Studio
     * @param messageType Type of message
     * @param data Message data
     * @returns true if the message was sent, false otherwise
     */
    sendMessage(messageType: string, data: any): Promise<boolean>;
    /**
     * Check if the connection is still alive
     * @private
     */
    private _checkConnection;
    /**
     * Register standard handlers for Roblox Studio messages
     * @private
     */
    private _registerStudioHandlers;
}
/**
 * Create a Roblox Studio adapter factory
 * @returns Factory function to create adapters
 */
export declare function createRoblexStudioAdapterFactory(): (connectionId: string) => RoblexStudioAdapter;
