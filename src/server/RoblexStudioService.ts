import express, { Request, Response, Router } from 'express';
import { RoblexStudioSequentialMcp } from './RoblexStudioSequentialMcp.js';
import { SSEServerTransport } from './SSEServerTransport.js';
import { McpServerFactory } from './McpServerFactory.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service options
 */
export interface RoblexStudioServiceOptions {
  version: string;
  apiPrefix?: string;
  concurrency?: number;
}

/**
 * Roblox Studio Service
 * Manages MCP server, endpoints, and connections for Roblox Studio
 */
export class RoblexStudioService {
  private _name: string = 'RoblexStudioMCP';
  private _version: string;
  private _apiPrefix: string;
  private _concurrency: number;
  private _server: RoblexStudioSequentialMcp;
  private _router: Router;
  private _transports: Map<string, SSEServerTransport> = new Map();
  
  /**
   * Create a new Roblox Studio service
   * @param options Service options
   */
  constructor(options: RoblexStudioServiceOptions) {
    this._version = options.version;
    this._apiPrefix = options.apiPrefix || '/api/roblox-studio';
    this._concurrency = options.concurrency || 1;
    
    // Create the sequential MCP server
    this._server = McpServerFactory.createSequential(
      {
        name: this._name,
        version: this._version,
        logger
      },
      this._concurrency
    ) as RoblexStudioSequentialMcp;
    
    // Create Express router
    this._router = express.Router();
    this._setupRoutes();
    
    logger.info(`RoblexStudioService created: v${this._version}, concurrency: ${this._concurrency}`);
    logger.info(`🚀 Sequential MCP is ACTIVE with concurrency ${this._concurrency}. Tools will be executed in sequence.`);
  }
  
  /**
   * Get the Express router
   */
  get router(): Router {
    return this._router;
  }
  
  /**
   * Setup Express routes
   */
  private _setupRoutes(): void {
    // SSE endpoint for event streaming
    this._router.get(`${this._apiPrefix}/events`, (req: Request, res: Response) => {
      this._handleSSEConnection(req, res);
    });
    
    // POST endpoint for sending messages to the server
    this._router.post(`${this._apiPrefix}/messages/:sessionId`, express.json(), (req: Request, res: Response) => {
      this._handleMessage(req, res);
    });
    
    // Disconnect endpoint
    this._router.post(`${this._apiPrefix}/disconnect/:sessionId`, (req: Request, res: Response) => {
      this._handleDisconnect(req, res);
    });
    
    // Health check endpoint
    this._router.get(`${this._apiPrefix}/health`, (req: Request, res: Response) => {
      res.json({
        status: 'ok',
        version: this._version,
        name: this._name,
        connections: this._transports.size
      });
    });

    // Queue stats endpoint
    this._router.get(`${this._apiPrefix}/queue/stats`, (req: Request, res: Response) => {
      const stats = this._server.getQueueStats();
      res.json({
        ...stats,
        serverName: this._name,
        version: this._version
      });
    });

    // Clear queue endpoint
    this._router.post(`${this._apiPrefix}/queue/clear`, (req: Request, res: Response) => {
      const count = this._server.clearQueue();
      res.json({
        success: true,
        message: `Queue cleared successfully. ${count} tasks removed.`,
        clearedCount: count
      });
    });

    // Update concurrency endpoint
    this._router.post(`${this._apiPrefix}/concurrency`, express.json(), (req: Request, res: Response) => {
      const concurrency = parseInt(req.body.concurrency);
      
      if (isNaN(concurrency) || concurrency < 1) {
        res.status(400).json({
          success: false,
          message: 'Invalid concurrency value. Must be a positive integer.'
        });
        return;
      }
      
      this._server.setConcurrency(concurrency);
      this._concurrency = concurrency;
      
      res.json({
        success: true,
        message: `Concurrency updated to ${concurrency}`,
        concurrency
      });
    });
    
    logger.info(`RoblexStudioService routes setup on prefix: ${this._apiPrefix}`);
  }
  
  /**
   * Handle SSE connection
   * @param req Express request
   * @param res Express response
   */
  private _handleSSEConnection(req: Request, res: Response): void {
    const sessionId = uuidv4();
    const path = `${this._apiPrefix}/events`;
    
    logger.info(`New SSE connection: ${sessionId}`);
    
    // Create SSE transport
    const transport = new SSEServerTransport(path, res);
    this._transports.set(sessionId, transport);
    
    // Connect to MCP server
    this._server.connect(transport).catch(error => {
      logger.error(`Error connecting transport: ${error instanceof Error ? error.message : String(error)}`);
    });
    
    // Handle client disconnection
    res.on('close', () => {
      this._handleSSEDisconnection(sessionId);
    });
  }
  
  /**
   * Handle SSE disconnection
   * @param sessionId Session ID to disconnect
   */
  private _handleSSEDisconnection(sessionId: string): void {
    logger.info(`SSE disconnection: ${sessionId}`);
    
    // Disconnect from MCP server
    this._server.disconnect(sessionId).catch(error => {
      logger.error(`Error disconnecting transport: ${error instanceof Error ? error.message : String(error)}`);
    });
    
    // Remove from transports map
    this._transports.delete(sessionId);
  }
  
  /**
   * Handle message from client
   * @param req Express request
   * @param res Express response
   */
  private _handleMessage(req: Request, res: Response): void {
    const sessionId = req.params.sessionId;
    const transport = this._transports.get(sessionId);
    
    if (!transport) {
      logger.warn(`Message received for unknown session: ${sessionId}`);
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    
    // Pass to transport for handling
    transport.handlePostMessage(req, res).catch(error => {
      logger.error(`Error handling message: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Server error' });
    });
  }
  
  /**
   * Handle explicit disconnect request
   * @param req Express request
   * @param res Express response
   */
  private _handleDisconnect(req: Request, res: Response): void {
    const sessionId = req.params.sessionId;
    
    this._handleSSEDisconnection(sessionId);
    
    res.json({ success: true, message: 'Disconnected' });
  }
  
  /**
   * Get the MCP server
   */
  get server(): RoblexStudioSequentialMcp {
    return this._server;
  }
  
  /**
   * Shutdown the service
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down RoblexStudioService');
    
    // Disconnect all transports
    await this._server.disconnectAll();
    
    // Clear transports map
    this._transports.clear();
    
    logger.info('RoblexStudioService shutdown complete');
  }
} 