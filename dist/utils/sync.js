"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectionGroups = exports.leaveGroup = exports.joinGroup = exports.broadcastToGroup = exports.broadcastToAll = exports.sendToConnection = exports.registerHandler = exports.init = void 0;
const ws_1 = require("ws");
const logger_js_1 = require("./logger.js");
const auth_js_1 = require("./auth.js");
const index_js_1 = require("../models/index.js");
/**
 * WebSocket synchronization system for real-time data updates
 */
// Active WebSocket connections
const activeConnections = new Map();
// Connection groups (for broadcast targeting)
const connectionGroups = new Map();
// Last message received timestamp for each connection
const lastActivity = new Map();
// Message handler registry
const messageHandlers = new Map();
/**
 * Initialize WebSocket server
 * @param server HTTP server instance
 * @param path WebSocket endpoint path
 */
function init(server, path = '/sync') {
    const wss = new ws_1.WebSocketServer({
        server,
        path
    });
    logger_js_1.logger.info(`WebSocket synchronization system initialized at ${path}`);
    wss.on('connection', (ws, req) => {
        // Generate connection ID and get session ID from query
        const connectionId = (0, auth_js_1.generateSessionId)('ws');
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const sessionId = url.searchParams.get('sessionId') || '';
        const groups = url.searchParams.get('groups') || '';
        // Register connection
        activeConnections.set(connectionId, ws);
        lastActivity.set(connectionId, Date.now());
        logger_js_1.logger.info(`WebSocket connection established: ${connectionId} (Session: ${sessionId})`);
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
        ws.on('message', (message) => {
            try {
                const parsedMessage = JSON.parse(message.toString());
                handleMessage(parsedMessage, connectionId, ws);
            }
            catch (error) {
                logger_js_1.logger.error(`Error parsing WebSocket message: ${error instanceof Error ? error.message : String(error)}`);
                send(ws, 'error', {
                    error: 'Invalid message format',
                    timestamp: new Date().toISOString()
                });
            }
        });
        // Set up close handler
        ws.on('close', () => {
            logger_js_1.logger.info(`WebSocket connection closed: ${connectionId}`);
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
            logger_js_1.logger.error(`WebSocket error for ${connectionId}: ${error.message}`);
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
exports.init = init;
/**
 * Register a message handler
 * @param messageType Type of message to handle
 * @param handler Handler function
 */
function registerHandler(messageType, handler) {
    if (!messageHandlers.has(messageType)) {
        messageHandlers.set(messageType, []);
    }
    messageHandlers.get(messageType).push(handler);
    logger_js_1.logger.debug(`Registered handler for message type: ${messageType}`);
}
exports.registerHandler = registerHandler;
/**
 * Handle incoming WebSocket message
 * @param message Parsed message
 * @param connectionId Connection ID
 * @param ws WebSocket connection
 */
async function handleMessage(message, connectionId, ws) {
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
        logger_js_1.logger.warn(`No handlers for message type: ${type}`);
        send(ws, 'error', { error: `Unknown message type: ${type}` });
        return;
    }
    try {
        // Execute all handlers
        const results = await Promise.all(handlers.map(handler => handler(data || {}, connectionId)));
        // Send response if requestId was provided
        if (requestId) {
            send(ws, 'response', {
                requestId,
                results: results.length === 1 ? results[0] : results
            });
        }
    }
    catch (error) {
        logger_js_1.logger.error(`Error handling message ${type}: ${error instanceof Error ? error.message : String(error)}`);
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
function send(ws, type, data) {
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
function broadcast(connections, type, data) {
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
function sendToConnection(connectionId, type, data) {
    const ws = activeConnections.get(connectionId);
    if (ws && ws.readyState === ws.OPEN) {
        send(ws, type, data);
        return true;
    }
    return false;
}
exports.sendToConnection = sendToConnection;
/**
 * Broadcast a message to all connections
 * @param type Message type
 * @param data Message data
 */
function broadcastToAll(type, data) {
    broadcast(Array.from(activeConnections.values()), type, data);
}
exports.broadcastToAll = broadcastToAll;
/**
 * Broadcast a message to a specific group
 * @param groupName Group name
 * @param type Message type
 * @param data Message data
 * @returns Number of connections the message was sent to
 */
function broadcastToGroup(groupName, type, data) {
    const group = connectionGroups.get(groupName);
    if (!group || group.size === 0) {
        return 0;
    }
    const connections = [];
    group.forEach(connectionId => {
        const ws = activeConnections.get(connectionId);
        if (ws && ws.readyState === ws.OPEN) {
            connections.push(ws);
        }
    });
    broadcast(connections, type, data);
    return connections.length;
}
exports.broadcastToGroup = broadcastToGroup;
/**
 * Add a connection to a group
 * @param connectionId Connection ID
 * @param groupName Group name
 */
function joinGroup(connectionId, groupName) {
    if (!connectionGroups.has(groupName)) {
        connectionGroups.set(groupName, new Set());
    }
    connectionGroups.get(groupName).add(connectionId);
    logger_js_1.logger.debug(`Connection ${connectionId} joined group ${groupName}`);
}
exports.joinGroup = joinGroup;
/**
 * Remove a connection from a group
 * @param connectionId Connection ID
 * @param groupName Group name
 */
function leaveGroup(connectionId, groupName) {
    const group = connectionGroups.get(groupName);
    if (group) {
        group.delete(connectionId);
        // Remove empty groups
        if (group.size === 0) {
            connectionGroups.delete(groupName);
        }
        logger_js_1.logger.debug(`Connection ${connectionId} left group ${groupName}`);
    }
}
exports.leaveGroup = leaveGroup;
/**
 * Get all groups a connection belongs to
 * @param connectionId Connection ID
 * @returns Array of group names
 */
function getConnectionGroups(connectionId) {
    const groups = [];
    connectionGroups.forEach((connections, groupName) => {
        if (connections.has(connectionId)) {
            groups.push(groupName);
        }
    });
    return groups;
}
exports.getConnectionGroups = getConnectionGroups;
/**
 * Send ping to all connections and cleanup stale ones
 */
function pingConnections() {
    activeConnections.forEach((ws, connectionId) => {
        if (ws.readyState === ws.OPEN) {
            ws.ping();
        }
    });
}
/**
 * Clean up stale connections
 */
function cleanupStaleConnections() {
    const now = Date.now();
    const staleThreshold = 2 * 60 * 1000; // 2 minutes
    activeConnections.forEach((ws, connectionId) => {
        const lastActivityTime = lastActivity.get(connectionId) || 0;
        if (now - lastActivityTime > staleThreshold) {
            logger_js_1.logger.info(`Closing stale connection: ${connectionId}`);
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
async function handleSubscribe(data, connectionId) {
    const { modelId, modelType } = data;
    if (!modelId && !modelType) {
        throw new Error('Either modelId or modelType is required');
    }
    if (modelId) {
        // Subscribe to updates for a specific model
        joinGroup(connectionId, `model:${modelId}`);
        // Return initial state
        const model = index_js_1.globalContext.getModel(modelId);
        if (!model) {
            throw new Error(`Model ${modelId} not found`);
        }
        return {
            modelId,
            state: model.state
        };
    }
    else if (modelType) {
        // Subscribe to updates for all models of a specific type
        joinGroup(connectionId, `type:${modelType}`);
        // Return initial states of all models of this type
        const models = index_js_1.globalContext.getAllModels().filter(model => model.getValue('type') === modelType);
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
async function handleUnsubscribe(data, connectionId) {
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
async function handleGetState(data, connectionId) {
    const { modelId } = data;
    if (modelId) {
        // Get state for a specific model
        const model = index_js_1.globalContext.getModel(modelId);
        if (!model) {
            throw new Error(`Model ${modelId} not found`);
        }
        return {
            modelId,
            state: model.state
        };
    }
    else {
        // Get all models if no modelId specified
        const models = index_js_1.globalContext.getAllModels();
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
async function handleUpdate(data, connectionId) {
    const { modelId, values } = data;
    if (!modelId || !values) {
        throw new Error('modelId and values are required');
    }
    const model = index_js_1.globalContext.getModel(modelId);
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
async function handlePing(data, connectionId) {
    return {
        pong: true,
        timestamp: new Date().toISOString(),
        connectionId
    };
}
//# sourceMappingURL=sync.js.map