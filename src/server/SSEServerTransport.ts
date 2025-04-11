import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';
import { Transport } from './McpServer.js';

/**
 * Server-Sent Events (SSE) transport for MCP server
 * Handles communication over SSE with Express
 */
export class SSEServerTransport implements Transport {
  sessionId: string;
  private _messageHandler: ((message: any) => Promise<void>) | null = null;
  private _messagesEndpoint: string;
  private _res: Response;
  private _extendedOptions: any = {};

  /**
   * Create a new SSE transport
   * @param messagesEndpoint Endpoint for POST messages
   * @param res Express response object for SSE connection
   */
  constructor(messagesEndpoint: string, res: Response) {
    this.sessionId = uuidv4();
    this._messagesEndpoint = messagesEndpoint;
    this._res = res;
  }

  /**
   * Send a message through the SSE connection
   * @param message Message to send
   */
  async send(message: any): Promise<void> {
    if (!this._res) {
      logger.warn(`Attempted to send message through closed SSE connection: ${this.sessionId}`);
      return;
    }

    try {
      // Add extended options to the first message
      if (message.type === 'server_info' && Object.keys(this._extendedOptions).length > 0) {
        message.extendedOptions = this._extendedOptions;
      }

      // Send message as SSE event
      this._res.write(`data: ${JSON.stringify(message)}\n\n`);
    } catch (error) {
      logger.error(`Error sending SSE message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Set message handler for incoming messages
   * @param handler Message handler function
   */
  onMessage(handler: (message: any) => Promise<void>): void {
    this._messageHandler = handler;
  }

  /**
   * Handle POST request to messages endpoint
   * @param req Express request
   * @param res Express response
   */
  async handlePostMessage(req: Request, res: Response): Promise<void> {
    if (!this._messageHandler) {
      logger.warn(`Received message without handler for session ${this.sessionId}`);
      res.status(500).json({ error: 'Message handler not registered' });
      return;
    }

    try {
      // Process the message with the registered handler
      await this._messageHandler(req.body);
      
      // Send success response
      res.status(200).json({ success: true });
    } catch (error) {
      logger.error(`Error handling POST message: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Set extended options for the first server message
   * @param options Extended options object
   */
  setExtendedOptions(options: any): void {
    this._extendedOptions = options || {};
  }

  /**
   * Disconnect this transport
   * Closes the SSE connection
   */
  async disconnect(): Promise<void> {
    try {
      // Send disconnection event
      this._res.write(`data: ${JSON.stringify({ type: 'disconnected' })}\n\n`);
      
      // End the response
      this._res.end();
      logger.info(`SSE transport disconnected: ${this.sessionId}`);
    } catch (error) {
      logger.error(`Error disconnecting SSE transport: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}