import { RoblexContext } from './RoblexContext.js';
import { RoblexModel } from './RoblexModel.js';
import { ModelState } from './types.js';
export type MessageHandler = (data: any) => Promise<any>;
/**
 * Protocol class for Roblex components
 * Implements the Protocol part of Model-Context-Protocol pattern
 */
export declare class RoblexProtocol {
    private _context;
    private _name;
    private _handlers;
    /**
     * Create a new protocol
     * @param name Protocol name for identification
     * @param context Associated context (optional, can be set later)
     */
    constructor(name: string, context?: RoblexContext);
    /**
     * Get the protocol name
     */
    get name(): string;
    /**
     * Get the associated context
     */
    get context(): RoblexContext;
    /**
     * Set the context for this protocol
     * @param context Context to associate with this protocol
     */
    setContext(context: RoblexContext): void;
    /**
     * Register a message handler
     * @param messageType Type of message to handle
     * @param handler Handler function that processes the message data
     */
    registerHandler(messageType: string, handler: MessageHandler): void;
    /**
     * Unregister a message handler
     * @param messageType Type of message
     * @param handler Handler function to remove
     * @returns true if handler was found and removed, false otherwise
     */
    unregisterHandler(messageType: string, handler: MessageHandler): boolean;
    /**
     * Process an incoming message
     * @param messageType Type of message
     * @param data Message data
     * @returns Array of results from all handlers
     */
    processMessage(messageType: string, data: any): Promise<any[]>;
    /**
     * Create a model and register it with the context
     * @param modelName Name for the new model
     * @param initialState Initial state for the model
     * @returns The created model
     */
    createModel(modelName: string, initialState?: ModelState): RoblexModel;
    /**
     * Update a model in the context with new state values
     * @param modelName Name of the model to update
     * @param values New values to set
     * @returns true if model was found and updated, false otherwise
     */
    updateModel(modelName: string, values: ModelState): boolean;
}
