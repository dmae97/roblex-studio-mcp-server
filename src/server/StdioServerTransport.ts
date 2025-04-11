import { v4 as uuidv4 } from 'uuid';
import { Transport } from './McpServer.js';
import { logger } from '../utils/logger.js';

/**
 * Stdio Server Transport implementation
 * Handles Standard Input/Output for communication with Claude Desktop
 */
export class StdioServerTransport implements Transport {
  public readonly sessionId: string;
  private connected: boolean = true;
  private lastHeartbeat: number = Date.now();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageHandler: ((message: any) => Promise<void>) | null = null;
  private readonly heartbeatIntervalMs: number = 30000; // 30 seconds

  /**
   * Create a new Stdio transport
   */
  constructor() {
    this.sessionId = uuidv4();
    this.startHeartbeat();

    // Setup stdin handling
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', this.handleStdinData.bind(this));
    process.stdin.on('end', () => {
      this.connected = false;
      this.stopHeartbeat();
      logger.debug(`Stdio connection closed: ${this.sessionId}`);
    });

    // Handle process exit
    process.on('exit', () => {
      this.disconnect();
    });

    logger.info(`Stdio transport created: ${this.sessionId}`);
  }

  /**
   * Handle data from standard input
   * @param data Input data
   */
  private async handleStdinData(data: Buffer | string): Promise<void> {
    if (!this.connected) {
      logger.warn(`Received message for disconnected transport: ${this.sessionId}`);
      return;
    }

    try {
      const message = JSON.parse(data.toString().trim());
      this.lastHeartbeat = Date.now();

      // Process message
      if (message.type === 'ping') {
        await this.send({
          type: 'pong',
          timestamp: Date.now()
        });
      } else if (this.messageHandler) {
        await this.messageHandler(message);
      }
    } catch (error) {
      logger.error(`Error handling stdin message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Send data to stdout
   * @param data Data to send
   */
  async send(data: any): Promise<void> {
    if (!this.connected) {
      logger.warn(`Attempt to send to disconnected transport: ${this.sessionId}`);
      return;
    }

    try {
      const message = JSON.stringify(data);
      process.stdout.write(message + '\n');
      this.lastHeartbeat = Date.now();
    } catch (error) {
      this.connected = false;
      logger.error(`Error sending stdout message: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Message handler callback
   */
  onMessage(handler: (message: any) => Promise<void>): void {
    this.messageHandler = handler;
  }

  /**
   * Disconnect the transport
   */
  async disconnect(): Promise<void> {
    if (!this.connected) return;
    
    this.connected = false;
    this.stopHeartbeat();
    logger.info(`Stdio transport disconnected: ${this.sessionId}`);
    
    // Send disconnect message
    try {
      await this.send({
        type: 'disconnect',
        timestamp: Date.now()
      });
    } catch (error) {
      // Ignore errors on disconnect
    }
  }

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
          this.send({
            type: 'heartbeat',
            timestamp: now
          });
        } catch (error) {
          logger.error(`Heartbeat error: ${error instanceof Error ? error.message : String(error)}`);
          this.connected = false;
          this.stopHeartbeat();
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
   * Check if the transport is still connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}
