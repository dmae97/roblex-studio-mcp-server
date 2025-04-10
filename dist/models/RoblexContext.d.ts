import { ModelState, IModel } from './types.js';
/**
 * Context class for Roblex components
 * Implements the Context part of Model-Context-Protocol pattern
 */
export declare class RoblexContext {
    private _models;
    private _name;
    /**
     * Create a new context
     * @param name Context name for identification
     */
    constructor(name: string);
    /**
     * Get the context name
     */
    get name(): string;
    /**
     * Register a model with this context
     * @param model Model to register
     */
    registerModel(model: IModel): void;
    /**
     * Unregister a model from this context
     * @param modelName Name of the model to unregister
     * @returns true if the model was found and removed, false otherwise
     */
    unregisterModel(modelName: string): boolean;
    /**
     * Get a model by name
     * @param modelName Name of the model to retrieve
     * @returns The model or undefined if not found
     */
    getModel(modelName: string): IModel | undefined;
    /**
     * Get all models in this context
     * @returns Array of all registered models
     */
    getAllModels(): IModel[];
    /**
     * Get a combined state from all models
     * @returns Combined state object with model names as keys
     */
    getState(): Record<string, ModelState>;
    /**
     * Get a specific value from a model in this context
     * @param modelName Name of the model
     * @param key Key in the model state
     * @param defaultValue Default value if key doesn't exist
     */
    getValue<T>(modelName: string, key: string, defaultValue?: T): T | undefined;
    /**
     * Set a value in a model in this context
     * @param modelName Name of the model
     * @param key Key in the model state
     * @param value Value to set
     * @returns true if the model was found and updated, false otherwise
     */
    setValue(modelName: string, key: string, value: any): boolean;
}
