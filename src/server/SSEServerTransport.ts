import { Transport } from './McpServer.js';
import { v4 as uuidv4 } from 'uuid';
import { Response, Request } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Server-Sent Events (SSE) transport for MCP communication
 */
export class SSEServerTransport implements Transport {
  private _sessionId: string;
  private _path: string;
  private _res: Response;
  private _messageHandler: ((message: any) => Promise<void>) | null = null;
  private _isConnected: boolean = false;
  
  /**
   * Create a new SSE transport
   * @param path URL path for the SSE endpoint
   * @param res Express response object
   */
  constructor(path: string, res: Response) {
    this._sessionId = uuidv4();
    this._path = path;
    this._res = res;
    
    // Configure response for SSE
    this._res.setHeader('Content-Type', 'text/event-stream');
    this._res.setHeader('Cache-Control', 'no-cache');
    this._res.setHeader('Connection', 'keep-alive');
    this._res.setHeader('X-Accel-Buffering', 'no'); // Prevents Nginx from buffering the SSE
    this._res.flushHeaders();
    
    this._isConnected = true;
    
    // Send initial connection success message
    this._sendEvent('connected', { sessionId: this._sessionId });
    
    logger.info(`SSE transport created: ${this._sessionId}`);
    
    // Handle client disconnection
    this._res.on('close', () => {
      this._isConnected = false;
      logger.info(`SSE client disconnected: ${this._sessionId}`);
    });
  }
  
  /**
   * Get the session ID
   */
  get sessionId(): string {
    return this._sessionId;
  }
  
  /**
   * Send a message through the SSE connection
   * @param message Message to send
   */
  async send(message: any): Promise<void> {
    if (!this._isConnected) {
      logger.warn(`Attempted to send message to disconnected client: ${this._sessionId}`);
      return;
    }
    
    this._sendEvent('message', message);
  }
  
  /**
   * Handle POST messages from client
   * @param req Express request object
   * @param res Express response object
   */
  async handlePostMessage(req: Request, res: Response): Promise<void> {
    if (!this._messageHandler) {
      logger.warn(`No message handler registered for SSE transport: ${this._sessionId}`);
      res.status(500).json({ error: 'Server not ready for messages' });
      return;
    }
    
    try {
      await this._messageHandler(req.body);
      res.status(200).json({ success: true });
    } catch (error) {
      logger.error(`Error handling POST message: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ 
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : String(error)
      });
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
   * Send an SSE event
   * @param event Event name
   * @param data Event data
   */
  private _sendEvent(event: string, data: any): void {
    if (!this._isConnected) {
      return;
    }
    
    try {
      this._res.write(`event: ${event}\n`);
      this._res.write(`data: ${JSON.stringify(data)}\n\n`);
      
      // Express Response에는 flush 메서드가 없으므로 생략
      // Node.js의 기본 응답 처리가 데이터를 적절히 전송
    } catch (error) {
      logger.error(`Error sending SSE event: ${error instanceof Error ? error.message : String(error)}`);
      this._isConnected = false;
    }
  }
  
  /**
   * Disconnect the transport
   */
  async disconnect(): Promise<void> {
    if (!this._isConnected) {
      return;
    }
    
    try {
      // Send end event
      this._sendEvent('disconnected', { sessionId: this._sessionId });
      
      // End the response
      this._res.end();
      this._isConnected = false;
      
      logger.info(`SSE transport disconnected: ${this._sessionId}`);
    } catch (error) {
      logger.error(`Error disconnecting SSE transport: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
} 