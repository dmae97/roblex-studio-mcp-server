"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoblexStudioAdapterFactory = exports.RoblexStudioAdapter = void 0;
const index_js_1 = require("./index.js");
const logger_js_1 = require("../utils/logger.js");
/**
 * Roblox Studio adapter for MCP connection
 * Handles communication between Roblox Studio and the MCP server
 */
class RoblexStudioAdapter {
    _protocol;
    _context;
    _connectionId;
    _isConnected = false;
    _lastPingTime = 0;
    _pingInterval = null;
    /**
     * Create a new Roblox Studio adapter
     * @param connectionId Unique identifier for this connection
     * @param useGlobal Whether to use the global protocol and context (default: true)
     */
    constructor(connectionId, useGlobal = true) {
        this._connectionId = connectionId;
        if (useGlobal) {
            this._protocol = index_js_1.globalProtocol;
            this._context = index_js_1.globalContext;
        }
        else {
            this._context = new index_js_1.RoblexContext(`RoblexStudio_${connectionId}`);
            this._protocol = new index_js_1.RoblexProtocol(`RoblexStudio_${connectionId}`, this._context);
        }
        logger_js_1.logger.info(`Created Roblox Studio adapter with connection ID: ${connectionId}`);
        this._registerStudioHandlers();
    }
    /**
     * Get the connection ID
     */
    get connectionId() {
        return this._connectionId;
    }
    /**
     * Get the connection status
     */
    get isConnected() {
        return this._isConnected;
    }
    /**
     * Get the protocol instance
     */
    get protocol() {
        return this._protocol;
    }
    /**
     * Get the context instance
     */
    get context() {
        return this._context;
    }
    /**
     * Initialize the connection with Roblox Studio
     */
    connect() {
        if (this._isConnected) {
            logger_js_1.logger.warn(`Roblox Studio adapter ${this._connectionId} already connected`);
            return;
        }
        this._isConnected = true;
        this._lastPingTime = Date.now();
        // Start ping interval to keep connection alive
        this._pingInterval = setInterval(() => this._checkConnection(), 30000);
        logger_js_1.logger.info(`Roblox Studio adapter ${this._connectionId} connected`);
        // Notify connection
        this._protocol.processMessage('studio:connected', {
            connectionId: this._connectionId,
            timestamp: Date.now()
        });
    }
    /**
     * Disconnect from Roblox Studio
     */
    disconnect() {
        if (!this._isConnected) {
            logger_js_1.logger.warn(`Roblox Studio adapter ${this._connectionId} already disconnected`);
            return;
        }
        this._isConnected = false;
        // Clear ping interval
        if (this._pingInterval) {
            clearInterval(this._pingInterval);
            this._pingInterval = null;
        }
        logger_js_1.logger.info(`Roblox Studio adapter ${this._connectionId} disconnected`);
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
    async handleMessage(messageType, data) {
        if (!this._isConnected) {
            logger_js_1.logger.warn(`Received message for disconnected adapter ${this._connectionId}`);
            return { error: true, message: 'Not connected' };
        }
        this._lastPingTime = Date.now();
        logger_js_1.logger.debug(`Handling message from Roblox Studio: ${messageType}`);
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
    async sendMessage(messageType, data) {
        if (!this._isConnected) {
            logger_js_1.logger.warn(`Cannot send message to disconnected adapter ${this._connectionId}`);
            return false;
        }
        logger_js_1.logger.debug(`Sending message to Roblox Studio: ${messageType}`);
        // In a real implementation, this would send the message to Roblox Studio
        // For now, just log it
        logger_js_1.logger.info(`Message sent to Roblox Studio: ${messageType} - ${JSON.stringify(data)}`);
        return true;
    }
    /**
     * Check if the connection is still alive
     * @private
     */
    _checkConnection() {
        const now = Date.now();
        const elapsed = now - this._lastPingTime;
        // If no ping for 2 minutes, disconnect
        if (elapsed > 120000) {
            logger_js_1.logger.warn(`No ping from Roblox Studio adapter ${this._connectionId} for ${elapsed}ms, disconnecting`);
            this.disconnect();
        }
    }
    /**
     * Register standard handlers for Roblox Studio messages
     * @private
     */
    _registerStudioHandlers() {
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
        // Studio connected handler
        this._protocol.registerHandler('studio:connected', async (data) => {
            logger_js_1.logger.info(`Studio connected: ${data.connectionId}`);
            return { success: true };
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
            const model = new index_js_1.RoblexModel(name, initialState);
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
            const model = new index_js_1.RoblexModel(modelName, {
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
exports.RoblexStudioAdapter = RoblexStudioAdapter;
/**
 * Create a Roblox Studio adapter factory
 * @returns Factory function to create adapters
 */
function createRoblexStudioAdapterFactory() {
    const adapters = new Map();
    return (connectionId) => {
        // Reuse existing adapter if it exists
        if (adapters.has(connectionId)) {
            return adapters.get(connectionId);
        }
        // Create new adapter
        const adapter = new RoblexStudioAdapter(connectionId);
        adapters.set(connectionId, adapter);
        return adapter;
    };
}
exports.createRoblexStudioAdapterFactory = createRoblexStudioAdapterFactory;
//# sourceMappingURL=RoblexStudioAdapter.js.map