import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { logger } from './logger.js';
import { generateSessionId } from './auth.js';
import { globalContext } from '../models/index.js';

/**
 * WebSocket synchronization system for real-time data updates
 */

// Active WebSocket connections
const activeConnections: Map<string, WebSocket> = new Map();

// Connection groups (for broadcast targeting)
const connectionGroups: Map<string, Set<string>> = new Map();

// Last message received timestamp for each connection
const lastActivity: Map<string, number> = new Map();

// Message handler registry
const messageHandlers: Map<string, Array<(data: any, connectionId: string) => Promise<any>>> = new Map();

/**
 * Initialize WebSocket server
 * @param server HTTP server instance
 * @param path WebSocket endpoint path
 */
export function init(server: http.Server, path: string = '/sync'): void {
  const wss = new WebSocketServer({ 
    server,
    path
  });
  
  logger.info(`WebSocket synchronization system initialized at ${path}`);
  
  wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
    // Generate connection ID and get session ID from query
    const connectionId = generateSessionId('ws');
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const sessionId = url.searchParams.get('sessionId') || '';
    const groups = url.searchParams.get('groups') || '';
    
    // Register connection
    activeConnections.set(connectionId, ws);
    lastActivity.set(connectionId, Date.now());
    
    logger.info(`WebSocket connection established: ${connectionId} (Session: ${sessionId})`);
    
    // Join connection groups if specified
    if (groups) {
      groups.split(',').forEach(group => {
        joinGroup(connectionId, group.trim());
      });
    }
    
    // Send connection confirmation
    send(ws, 'connection:established', {
      connectionId,
      timestamp: new Date().toISOString(),
      groups: getConnectionGroups(connectionId)
    });
    
    // Set up message handler
    ws.on('message', (message: WebSocket.Data) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        handleMessage(parsedMessage, connectionId, ws);
      } catch (error) {
        logger.error(`Error parsing WebSocket message: ${error instanceof Error ? error.message : String(error)}`);
        send(ws, 'error', { 
          error: 'Invalid message format',
          timestamp: new Date().toISOString() 
        });
      }
    });
    
    // Set up close handler
    ws.on('close', () => {
      logger.info(`WebSocket connection closed: ${connectionId}`);
      
      // Remove from all groups
      getConnectionGroups(connectionId).forEach(group => {
        leaveGroup(connectionId, group);
      });
      
      // Remove connection
      activeConnections.delete(connectionId);
      lastActivity.delete(connectionId);
    });
    
    // Set up error handler
    ws.on('error', (error) => {
      logger.error(`WebSocket error for ${connectionId}: ${error.message}`);
    });
    
    // Set up pong handler for connection keepalive
    ws.on('pong', () => {
      lastActivity.set(connectionId, Date.now());
    });
  });
  
  // Start the ping/cleanup interval
  setInterval(() => {
    pingConnections();
    cleanupStaleConnections();
  }, 30000); // Every 30 seconds
  
  // Register default message handlers
  registerHandler('sync:subscribe', handleSubscribe);
  registerHandler('sync:unsubscribe', handleUnsubscribe);
  registerHandler('sync:getState', handleGetState);
  registerHandler('sync:update', handleUpdate);
  registerHandler('ping', handlePing);
}

/**
 * Register a message handler
 * @param messageType Type of message to handle
 * @param handler Handler function
 */
export function registerHandler(
  messageType: string, 
  handler: (data: any, connectionId: string) => Promise<any>
): void {
  if (!messageHandlers.has(messageType)) {
    messageHandlers.set(messageType, []);
  }
  
  messageHandlers.get(messageType)!.push(handler);
  logger.debug(`Registered handler for message type: ${messageType}`);
}

/**
 * Handle incoming WebSocket message
 * @param message Parsed message
 * @param connectionId Connection ID
 * @param ws WebSocket connection
 */
async function handleMessage(message: any, connectionId: string, ws: WebSocket): Promise<void> {
  // Update last activity timestamp
  lastActivity.set(connectionId, Date.now());
  
  const { type, data, requestId } = message;
  
  if (!type) {
    send(ws, 'error', { error: 'Message type is required' });
    return;
  }
  
  // Get handlers for this message type
  const handlers = messageHandlers.get(type) || [];
  
  if (handlers.length === 0) {
    logger.warn(`No handlers for message type: ${type}`);
    send(ws, 'error', { error: `Unknown message type: ${type}` });
    return;
  }
  
  try {
    // Execute all handlers
    const results = await Promise.all(
      handlers.map(handler => handler(data || {}, connectionId))
    );
    
    // Send response if requestId was provided
    if (requestId) {
      send(ws, 'response', {
        requestId,
        results: results.length === 1 ? results[0] : results
      });
    }
  } catch (error) {
    logger.error(`Error handling message ${type}: ${error instanceof Error ? error.message : String(error)}`);
    
    if (requestId) {
      send(ws, 'error', {
        requestId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

/**
 * Send a message to a WebSocket connection
 * @param ws WebSocket connection
 * @param type Message type
 * @param data Message data
 */
function send(ws: WebSocket, type: string, data: any): void {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({
      type,
      data,
      timestamp: new Date().toISOString()
    }));
  }
}

/**
 * Broadcast a message to multiple connections
 * @param connections WebSocket connections
 * @param type Message type
 * @param data Message data
 */
function broadcast(connections: WebSocket[], type: string, data: any): void {
  const message = JSON.stringify({
    type,
    data,
    timestamp: new Date().toISOString()
  });
  
  connections.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  });
}

/**
 * Send a message to a specific connection
 * @param connectionId Connection ID
 * @param type Message type
 * @param data Message data
 * @returns true if sent, false if connection not found or closed
 */
export function sendToConnection(connectionId: string, type: string, data: any): boolean {
  const ws = activeConnections.get(connectionId);
  
  if (ws && ws.readyState === ws.OPEN) {
    send(ws, type, data);
    return true;
  }
  
  return false;
}

/**
 * Broadcast a message to all connections
 * @param type Message type
 * @param data Message data
 */
export function broadcastToAll(type: string, data: any): void {
  broadcast(Array.from(activeConnections.values()), type, data);
}

/**
 * Broadcast a message to a specific group
 * @param groupName Group name
 * @param type Message type
 * @param data Message data
 * @returns Number of connections the message was sent to
 */
export function broadcastToGroup(groupName: string, type: string, data: any): number {
  const group = connectionGroups.get(groupName);
  
  if (!group || group.size === 0) {
    return 0;
  }
  
  const connections: WebSocket[] = [];
  
  group.forEach(connectionId => {
    const ws = activeConnections.get(connectionId);
    
    if (ws && ws.readyState === ws.OPEN) {
      connections.push(ws);
    }
  });
  
  broadcast(connections, type, data);
  return connections.length;
}

/**
 * Add a connection to a group
 * @param connectionId Connection ID
 * @param groupName Group name
 */
export function joinGroup(connectionId: string, groupName: string): void {
  if (!connectionGroups.has(groupName)) {
    connectionGroups.set(groupName, new Set());
  }
  
  connectionGroups.get(groupName)!.add(connectionId);
  logger.debug(`Connection ${connectionId} joined group ${groupName}`);
}

/**
 * Remove a connection from a group
 * @param connectionId Connection ID
 * @param groupName Group name
 */
export function leaveGroup(connectionId: string, groupName: string): void {
  const group = connectionGroups.get(groupName);
  
  if (group) {
    group.delete(connectionId);
    
    // Remove empty groups
    if (group.size === 0) {
      connectionGroups.delete(groupName);
    }
    
    logger.debug(`Connection ${connectionId} left group ${groupName}`);
  }
}

/**
 * Get all groups a connection belongs to
 * @param connectionId Connection ID
 * @returns Array of group names
 */
export function getConnectionGroups(connectionId: string): string[] {
  const groups: string[] = [];
  
  connectionGroups.forEach((connections, groupName) => {
    if (connections.has(connectionId)) {
      groups.push(groupName);
    }
  });
  
  return groups;
}

/**
 * Send ping to all connections and cleanup stale ones
 */
function pingConnections(): void {
  activeConnections.forEach((ws, connectionId) => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
    }
  });
}

/**
 * Clean up stale connections
 */
function cleanupStaleConnections(): void {
  const now = Date.now();
  const staleThreshold = 2 * 60 * 1000; // 2 minutes
  
  activeConnections.forEach((ws, connectionId) => {
    const lastActivityTime = lastActivity.get(connectionId) || 0;
    
    if (now - lastActivityTime > staleThreshold) {
      logger.info(`Closing stale connection: ${connectionId}`);
      ws.terminate();
      
      // Remove from all groups
      getConnectionGroups(connectionId).forEach(group => {
        leaveGroup(connectionId, group);
      });
      
      // Remove connection
      activeConnections.delete(connectionId);
      lastActivity.delete(connectionId);
    }
  });
}

/**
 * Default handler for sync:subscribe messages
 */
async function handleSubscribe(data: any, connectionId: string): Promise<any> {
  const { modelId, modelType } = data;
  
  if (!modelId && !modelType) {
    throw new Error('Either modelId or modelType is required');
  }
  
  if (modelId) {
    // Subscribe to updates for a specific model
    joinGroup(connectionId, `model:${modelId}`);
    
    // Return initial state
    const model = globalContext.getModel(modelId);
    
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }
    
    return {
      modelId,
      state: model.state
    };
  } else if (modelType) {
    // Subscribe to updates for all models of a specific type
    joinGroup(connectionId, `type:${modelType}`);
    
    // Return initial states of all models of this type
    const models = globalContext.getAllModels().filter(model => 
      model.getValue('type') === modelType
    );
    
    return {
      modelType,
      models: models.map(model => ({
        modelId: model.name,
        state: model.state
      }))
    };
  }
  
  return { success: true };
}

/**
 * Default handler for sync:unsubscribe messages
 */
async function handleUnsubscribe(data: any, connectionId: string): Promise<any> {
  const { modelId, modelType, all } = data;
  
  if (all) {
    // Unsubscribe from all
    getConnectionGroups(connectionId).forEach(group => {
      leaveGroup(connectionId, group);
    });
    
    return { success: true };
  }
  
  if (modelId) {
    // Unsubscribe from a specific model
    leaveGroup(connectionId, `model:${modelId}`);
  }
  
  if (modelType) {
    // Unsubscribe from all models of a specific type
    leaveGroup(connectionId, `type:${modelType}`);
  }
  
  return { success: true };
}

/**
 * Default handler for sync:getState messages
 */
async function handleGetState(data: any, connectionId: string): Promise<any> {
  const { modelId } = data;
  
  if (modelId) {
    // Get state for a specific model
    const model = globalContext.getModel(modelId);
    
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }
    
    return {
      modelId,
      state: model.state
    };
  } else {
    // Get all models if no modelId specified
    const models = globalContext.getAllModels();
    
    return {
      models: models.map(model => ({
        modelId: model.name,
        state: model.state
      }))
    };
  }
}

/**
 * Default handler for sync:update messages
 */
async function handleUpdate(data: any, connectionId: string): Promise<any> {
  const { modelId, values } = data;
  
  if (!modelId || !values) {
    throw new Error('modelId and values are required');
  }
  
  const model = globalContext.getModel(modelId);
  
  if (!model) {
    throw new Error(`Model ${modelId} not found`);
  }
  
  // Update model
  model.setValues(values);
  
  // Broadcast update to all subscribed connections (except the sender)
  const modelGroup = connectionGroups.get(`model:${modelId}`);
  const typeGroup = connectionGroups.get(`type:${model.getValue('type')}`);
  
  const updateMessage = {
    modelId,
    values,
    updatedBy: connectionId
  };
  
  if (modelGroup) {
    modelGroup.forEach(connId => {
      if (connId !== connectionId) {
        sendToConnection(connId, 'sync:modelUpdated', updateMessage);
      }
    });
  }
  
  if (typeGroup) {
    typeGroup.forEach(connId => {
      if (connId !== connectionId && (!modelGroup || !modelGroup.has(connId))) {
        sendToConnection(connId, 'sync:modelUpdated', updateMessage);
      }
    });
  }
  
  return {
    success: true,
    modelId,
    updatedValues: values
  };
}

/**
 * Handler for ping messages
 */
async function handlePing(data: any, connectionId: string): Promise<any> {
  return {
    pong: true,
    timestamp: new Date().toISOString(),
    connectionId
  };
} 