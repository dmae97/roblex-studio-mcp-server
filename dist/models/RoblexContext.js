import { logger } from '../utils/logger.js';
/**
 * Context class for Roblex components
 * Implements the Context part of Model-Context-Protocol pattern
 */
export class RoblexContext {
    _models;
    _name;
    /**
     * Create a new context
     * @param name Context name for identification
     */
    constructor(name) {
        this._name = name;
        this._models = new Map();
        logger.debug(`Context created: ${name}`);
    }
    /**
     * Get the context name
     */
    get name() {
        return this._name;
    }
    /**
     * Register a model with this context
     * @param model Model to register
     */
    registerModel(model) {
        if (this._models.has(model.name)) {
            logger.warn(`Model with name ${model.name} already registered, replacing`);
        }
        this._models.set(model.name, model);
        logger.debug(`Model ${model.name} registered with context ${this._name}`);
    }
    /**
     * Unregister a model from this context
     * @param modelName Name of the model to unregister
     * @returns true if the model was found and removed, false otherwise
     */
    unregisterModel(modelName) {
        const result = this._models.delete(modelName);
        if (result) {
            logger.debug(`Model ${modelName} unregistered from context ${this._name}`);
        }
        return result;
    }
    /**
     * Get a model by name
     * @param modelName Name of the model to retrieve
     * @returns The model or undefined if not found
     */
    getModel(modelName) {
        return this._models.get(modelName);
    }
    /**
     * Get all models in this context
     * @returns Array of all registered models
     */
    getAllModels() {
        return Array.from(this._models.values());
    }
    /**
     * Get a combined state from all models
     * @returns Combined state object with model names as keys
     */
    getState() {
        const state = {};
        for (const [name, model] of this._models.entries()) {
            state[name] = model.state;
        }
        return state;
    }
    /**
     * Get a specific value from a model in this context
     * @param modelName Name of the model
     * @param key Key in the model state
     * @param defaultValue Default value if key doesn't exist
     */
    getValue(modelName, key, defaultValue) {
        const model = this._models.get(modelName);
        if (!model) {
            return defaultValue;
        }
        return model.getValue(key, defaultValue);
    }
    /**
     * Set a value in a model in this context
     * @param modelName Name of the model
     * @param key Key in the model state
     * @param value Value to set
     * @returns true if the model was found and updated, false otherwise
     */
    setValue(modelName, key, value) {
        const model = this._models.get(modelName);
        if (!model) {
            return false;
        }
        model.setValue(key, value);
        return true;
    }
}
//# sourceMappingURL=RoblexContext.js.map