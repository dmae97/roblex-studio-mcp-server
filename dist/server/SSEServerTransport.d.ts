/// <reference types="cookie-parser" />
import { Transport } from './McpServer.js';
import { Response, Request } from 'express';
/**
 * Server-Sent Events (SSE) transport for MCP communication
 */
export declare class SSEServerTransport implements Transport {
    private _sessionId;
    private _path;
    private _res;
    private _messageHandler;
    private _isConnected;
    /**
     * Create a new SSE transport
     * @param path URL path for the SSE endpoint
     * @param res Express response object
     */
    constructor(path: string, res: Response);
    /**
     * Get the session ID
     */
    get sessionId(): string;
    /**
     * Send a message through the SSE connection
     * @param message Message to send
     */
    send(message: any): Promise<void>;
    /**
     * Handle POST messages from client
     * @param req Express request object
     * @param res Express response object
     */
    handlePostMessage(req: Request, res: Response): Promise<void>;
    /**
     * Set message handler for incoming messages
     * @param handler Message handler function
     */
    onMessage(handler: (message: any) => Promise<void>): void;
    /**
     * Send an SSE event
     * @param event Event name
     * @param data Event data
     */
    private _sendEvent;
    /**
     * Disconnect the transport
     */
    disconnect(): Promise<void>;
}
