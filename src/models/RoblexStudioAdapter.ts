import { RoblexModel, RoblexContext, RoblexProtocol, globalContext, globalProtocol } from './index.js';
import { logger } from '../utils/logger.js';
import { ModelState } from './types.js';

/**
 * Roblox Studio adapter for MCP connection
 * Handles communication between Roblox Studio and the MCP server
 */
export class RoblexStudioAdapter {
  private _protocol: RoblexProtocol;
  private _context: RoblexContext;
  private _connectionId: string;
  private _isConnected: boolean = false;
  private _lastPingTime: number = 0;
  private _pingInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Create a new Roblox Studio adapter
   * @param connectionId Unique identifier for this connection
   * @param useGlobal Whether to use the global protocol and context (default: true)
   */
  constructor(connectionId: string, useGlobal: boolean = true) {
    this._connectionId = connectionId;
    
    if (useGlobal) {
      this._protocol = globalProtocol;
      this._context = globalContext;
    } else {
      this._context = new RoblexContext(`RoblexStudio_${connectionId}`);
      this._protocol = new RoblexProtocol(`RoblexStudio_${connectionId}`, this._context);
    }
    
    logger.info(`Created Roblox Studio adapter with connection ID: ${connectionId}`);
    
    this._registerStudioHandlers();
  }
  
  /**
   * Get the connection ID
   */
  get connectionId(): string {
    return this._connectionId;
  }
  
  /**
   * Get the connection status
   */
  get isConnected(): boolean {
    return this._isConnected;
  }
  
  /**
   * Get the protocol instance
   */
  get protocol(): RoblexProtocol {
    return this._protocol;
  }
  
  /**
   * Get the context instance
   */
  get context(): RoblexContext {
    return this._context;
  }
  
  /**
   * Initialize the connection with Roblox Studio
   */
  connect(): void {
    if (this._isConnected) {
      logger.warn(`Roblox Studio adapter ${this._connectionId} already connected`);
      return;
    }
    
    this._isConnected = true;
    this._lastPingTime = Date.now();
    
    // Start ping interval to keep connection alive
    this._pingInterval = setInterval(() => this._checkConnection(), 30000);
    
    logger.info(`Roblox Studio adapter ${this._connectionId} connected`);
    
    // Notify connection
    this._protocol.processMessage('studio:connected', {
      connectionId: this._connectionId,
      timestamp: Date.now()
    });
  }
  
  /**
   * Disconnect from Roblox Studio
   */
  disconnect(): void {
    if (!this._isConnected) {
      logger.warn(`Roblox Studio adapter ${this._connectionId} already disconnected`);
      return;
    }
    
    this._isConnected = false;
    
    // Clear ping interval
    if (this._pingInterval) {
      clearInterval(this._pingInterval);
      this._pingInterval = null;
    }
    
    logger.info(`Roblox Studio adapter ${this._connectionId} disconnected`);
    
    // Notify disconnection
    this._protocol.processMessage('studio:disconnected', {
      connectionId: this._connectionId,
      timestamp: Date.now()
    });
  }
  
  /**
   * Handle incoming message from Roblox Studio
   * @param messageType Type of message
   * @param data Message data
   * @returns Response data
   */
  async handleMessage(messageType: string, data: any): Promise<any> {
    if (!this._isConnected) {
      logger.warn(`Received message for disconnected adapter ${this._connectionId}`);
      return { error: true, message: 'Not connected' };
    }
    
    this._lastPingTime = Date.now();
    
    logger.debug(`Handling message from Roblox Studio: ${messageType}`);
    
    // Process the message through the protocol
    const results = await this._protocol.processMessage(messageType, data);
    
    return results.length > 0 ? results[0] : { received: true };
  }
  
  /**
   * Send a message to Roblox Studio
   * @param messageType Type of message
   * @param data Message data
   * @returns true if the message was sent, false otherwise
   */
  async sendMessage(messageType: string, data: any): Promise<boolean> {
    if (!this._isConnected) {
      logger.warn(`Cannot send message to disconnected adapter ${this._connectionId}`);
      return false;
    }
    
    logger.debug(`Sending message to Roblox Studio: ${messageType}`);
    
    // In a real implementation, this would send the message to Roblox Studio
    // For now, just log it
    logger.info(`Message sent to Roblox Studio: ${messageType} - ${JSON.stringify(data)}`);
    
    return true;
  }
  
  /**
   * Check if the connection is still alive
   * @private
   */
  private _checkConnection(): void {
    const now = Date.now();
    const elapsed = now - this._lastPingTime;
    
    // If no ping for 2 minutes, disconnect
    if (elapsed > 120000) {
      logger.warn(`No ping from Roblox Studio adapter ${this._connectionId} for ${elapsed}ms, disconnecting`);
      this.disconnect();
    }
  }
  
  /**
   * Register standard handlers for Roblox Studio messages
   * @private
   */
  private _registerStudioHandlers(): void {
    // Register basic handlers
    
    // Ping handler to keep connection alive
    this._protocol.registerHandler('studio:ping', async (data) => {
      this._lastPingTime = Date.now();
      return {
        pong: true,
        timestamp: Date.now(),
        connectionId: this._connectionId
      };
    });
    
    // Get all models in the context
    this._protocol.registerHandler('studio:getModels', async () => {
      const models = this._context.getAllModels();
      return {
        models: models.map(model => ({
          name: model.name,
          state: model.state
        }))
      };
    });
    
    // Create a new model in the context
    this._protocol.registerHandler('studio:createModel', async (data) => {
      const { name, initialState } = data;
      
      const model = new RoblexModel(name, initialState);
      this._context.registerModel(model);
      
      return {
        success: true,
        model: {
          name: model.name,
          state: model.state
        }
      };
    });
    
    // Update a model in the context
    this._protocol.registerHandler('studio:updateModel', async (data) => {
      const { modelName, values } = data;
      
      const model = this._context.getModel(modelName);
      
      if (!model) {
        return {
          success: false,
          error: `Model ${modelName} not found`
        };
      }
      
      model.setValues(values);
      
      return {
        success: true,
        model: {
          name: model.name,
          state: model.state
        }
      };
    });
    
    // Delete a model from the context
    this._protocol.registerHandler('studio:deleteModel', async (data) => {
      const { modelName } = data;
      
      const success = this._context.unregisterModel(modelName);
      
      return {
        success,
        modelName
      };
    });
    
    // Get full context state
    this._protocol.registerHandler('studio:getState', async () => {
      return {
        state: this._context.getState()
      };
    });
    
    // Create a workspace object
    this._protocol.registerHandler('studio:createWorkspaceObject', async (data) => {
      const { className, name, properties } = data;
      
      // In a real implementation, this would create an object in Roblox Studio
      // For now, just create a model to track it
      const modelName = `Workspace_${className}_${name}`;
      const model = new RoblexModel(modelName, {
        className,
        name,
        parent: 'Workspace',
        ...properties
      });
      
      this._context.registerModel(model);
      
      return {
        success: true,
        modelName,
        state: model.state
      };
    });
    
    // Subscribe to a model's changes
    this._protocol.registerHandler('studio:subscribeToModel', async (data) => {
      const { modelName } = data;
      
      const model = this._context.getModel(modelName);
      
      if (!model) {
        return {
          success: false,
          error: `Model ${modelName} not found`
        };
      }
      
      // In a real implementation, this would set up a subscription
      // For now, just return success
      
      return {
        success: true,
        modelName,
        state: model.state
      };
    });
  }
}

/**
 * Create a Roblox Studio adapter factory
 * @returns Factory function to create adapters
 */
export function createRoblexStudioAdapterFactory(): (connectionId: string) => RoblexStudioAdapter {
  const adapters: Map<string, RoblexStudioAdapter> = new Map();
  
  return (connectionId: string): RoblexStudioAdapter => {
    // Reuse existing adapter if it exists
    if (adapters.has(connectionId)) {
      return adapters.get(connectionId)!;
    }
    
    // Create new adapter
    const adapter = new RoblexStudioAdapter(connectionId);
    adapters.set(connectionId, adapter);
    
    return adapter;
  };
} 