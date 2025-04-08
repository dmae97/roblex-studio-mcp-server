"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoblexProtocol = void 0;
const RoblexContext_js_1 = require("./RoblexContext.js");
const RoblexModel_js_1 = require("./RoblexModel.js");
const logger_js_1 = require("../utils/logger.js");
/**
 * Protocol class for Roblex components
 * Implements the Protocol part of Model-Context-Protocol pattern
 */
class RoblexProtocol {
    _context;
    _name;
    _handlers;
    /**
     * Create a new protocol
     * @param name Protocol name for identification
     * @param context Associated context (optional, can be set later)
     */
    constructor(name, context) {
        this._name = name;
        this._context = context || new RoblexContext_js_1.RoblexContext(`${name}Context`);
        this._handlers = new Map();
        logger_js_1.logger.debug(`Protocol created: ${name}`);
    }
    /**
     * Get the protocol name
     */
    get name() {
        return this._name;
    }
    /**
     * Get the associated context
     */
    get context() {
        return this._context;
    }
    /**
     * Set the context for this protocol
     * @param context Context to associate with this protocol
     */
    setContext(context) {
        this._context = context;
        logger_js_1.logger.debug(`Context set for protocol ${this._name}: ${context.name}`);
    }
    /**
     * Register a message handler
     * @param messageType Type of message to handle
     * @param handler Handler function that processes the message data
     */
    registerHandler(messageType, handler) {
        if (!this._handlers.has(messageType)) {
            this._handlers.set(messageType, []);
        }
        this._handlers.get(messageType).push(handler);
        logger_js_1.logger.debug(`Handler registered for message type ${messageType} in protocol ${this._name}`);
    }
    /**
     * Unregister a message handler
     * @param messageType Type of message
     * @param handler Handler function to remove
     * @returns true if handler was found and removed, false otherwise
     */
    unregisterHandler(messageType, handler) {
        if (!this._handlers.has(messageType)) {
            return false;
        }
        const handlers = this._handlers.get(messageType);
        const initialLength = handlers.length;
        const filteredHandlers = handlers.filter(h => h !== handler);
        this._handlers.set(messageType, filteredHandlers);
        const removed = initialLength > filteredHandlers.length;
        if (removed) {
            logger_js_1.logger.debug(`Handler unregistered for message type ${messageType} in protocol ${this._name}`);
        }
        return removed;
    }
    /**
     * Process an incoming message
     * @param messageType Type of message
     * @param data Message data
     * @returns Array of results from all handlers
     */
    async processMessage(messageType, data) {
        const handlers = this._handlers.get(messageType) || [];
        if (handlers.length === 0) {
            logger_js_1.logger.warn(`No handlers found for message type ${messageType} in protocol ${this._name}`);
            return [];
        }
        logger_js_1.logger.debug(`Processing message type ${messageType} with ${handlers.length} handlers`);
        const results = [];
        for (const handler of handlers) {
            try {
                const result = await handler(data);
                results.push(result);
            }
            catch (error) {
                logger_js_1.logger.error(`Error in handler for message type ${messageType}: ${error instanceof Error ? error.message : String(error)}`);
                results.push({ error: true, message: error instanceof Error ? error.message : String(error) });
            }
        }
        return results;
    }
    /**
     * Create a model and register it with the context
     * @param modelName Name for the new model
     * @param initialState Initial state for the model
     * @returns The created model
     */
    createModel(modelName, initialState = {}) {
        const model = new RoblexModel_js_1.RoblexModel(modelName, initialState);
        this._context.registerModel(model);
        return model;
    }
    /**
     * Update a model in the context with new state values
     * @param modelName Name of the model to update
     * @param values New values to set
     * @returns true if model was found and updated, false otherwise
     */
    updateModel(modelName, values) {
        const model = this._context.getModel(modelName);
        if (!model) {
            logger_js_1.logger.warn(`Can't update model ${modelName}: not found in context ${this._context.name}`);
            return false;
        }
        model.setValues(values);
        return true;
    }
}
exports.RoblexProtocol = RoblexProtocol;
//# sourceMappingURL=RoblexProtocol.js.map