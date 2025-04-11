import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Transport } from './McpServer.js';
import { logger } from '../utils/logger.js';

/**
 * SSE Server Transport implementation
 * Handles Server-Sent Events for real-time communication
 */
export class SSEServerTransport implements Transport {
  public readonly sessionId: string;
  private readonly messagesPath: string;
  private readonly res: express.Response;
  private connected: boolean = true;
  private lastHeartbeat: number = Date.now();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private readonly heartbeatIntervalMs: number = 30000; // 30 seconds

  /**
   * Create a new SSE transport
   * @param messagesPath Path for receiving messages from client
   * @param res Express response object
   */
  constructor(messagesPath: string, res: express.Response) {
    this.sessionId = uuidv4();
    this.messagesPath = messagesPath;
    this.res = res;
    
    // Setup SSE headers for better browser compatibility
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Prevents Nginx from buffering the response
    });

    // Start heartbeat to keep connection alive
    this.startHeartbeat();
    
    // Handle client disconnect
    res.on('close', () => {
      this.connected = false;
      this.stopHeartbeat();
      logger.debug(`SSE connection closed: ${this.sessionId}`);
    });
  }

  /**
   * Send data to the client
   * @param data Data to send
   */
  async send(data: any): Promise<void> {
    if (!this.connected) {
      logger.warn(`Attempt to send to disconnected transport: ${this.sessionId}`);
      return;
    }

    try {
      const message = `data: ${JSON.stringify(data)}\n\n`;
      const success = this.res.write(message);
      
      // Handle backpressure
      if (!success) {
        logger.warn(`Backpressure detected on SSE transport: ${this.sessionId}`);
      }
      
      this.lastHeartbeat = Date.now(); // Reset heartbeat timer on successful send
    } catch (error) {
      this.connected = false;
      logger.error(`Error sending SSE message: ${error instanceof Error ? error.message : String(error)}`);
      this.attemptReconnect();
      throw error;
    }
  }

  /**
   * Handle HTTP POST message from client
   * @param req Express request
   * @param res Express response
   */
  async handlePostMessage(req: express.Request, res: express.Response): Promise<void> {
    if (!this.connected) {
      logger.warn(`Received message for disconnected transport: ${this.sessionId}`);
      res.status(410).json({ error: 'Transport disconnected' });
      return;
    }

    try {
      // Process the message based on its type
      const { type, data } = req.body;
      
      // Route the message to appropriate handler based on type
      if (type === 'ping') {
        // Handle ping/heartbeat from client
        this.lastHeartbeat = Date.now();
        res.json({ type: 'pong', timestamp: Date.now() });
      } else {
        // For all other messages, let the client know we received it
        res.json({ received: true, type });
        
        // Then emit the event to our event listener (handled by McpServer)
        if (this.onMessage) {
          await this.onMessage({ type, data });
        }
      }
    } catch (error) {
      logger.error(`Error handling POST message: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Error processing message' });
    }
  }

  /**
   * Get the path for receiving messages
   */
  getMessagesPath(): string {
    return `${this.messagesPath}?sessionId=${this.sessionId}`;
  }

  /**
   * Message handler callback
   */
  onMessage: ((data: any) => Promise<void>) | null = null;

  /**
   * Start sending heartbeats to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (!this.connected) {
        this.stopHeartbeat();
        return;
      }
      
      // Check if we haven't sent anything for a while
      const now = Date.now();
      if (now - this.lastHeartbeat > this.heartbeatIntervalMs) {
        try {
          // Send heartbeat
          this.res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: now })}\n\n`);
          this.lastHeartbeat = now;
        } catch (error) {
          logger.error(`Heartbeat error: ${error instanceof Error ? error.message : String(error)}`);
          this.connected = false;
          this.stopHeartbeat();
          this.attemptReconnect();
        }
      }
    }, this.heartbeatIntervalMs);
  }

  /**
   * Stop sending heartbeats
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Attempt to reconnect if connection is lost
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error(`Maximum reconnect attempts reached for session: ${this.sessionId}`);
      return;
    }

    this.reconnectAttempts++;
    logger.info(`Attempting to reconnect SSE transport (${this.reconnectAttempts}/${this.maxReconnectAttempts}): ${this.sessionId}`);
    
    // Try to reestablish connection
    try {
      this.connected = true;
      this.res.write(`data: ${JSON.stringify({ type: 'reconnected', timestamp: Date.now() })}\n\n`);
      this.lastHeartbeat = Date.now();
      this.startHeartbeat();
    } catch (error) {
      this.connected = false;
      logger.error(`Reconnect failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if the transport is still connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}
