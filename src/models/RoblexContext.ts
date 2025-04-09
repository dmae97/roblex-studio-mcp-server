import { RoblexModel } from './RoblexModel.js';
import { logger } from '../utils/logger.js';
import { ModelState, IModel } from './types.js';

/**
 * Context class for Roblex components
 * Implements the Context part of Model-Context-Protocol pattern
 */
export class RoblexContext {
  private _models: Map<string, IModel>;
  private _name: string;
  
  /**
   * Create a new context
   * @param name Context name for identification
   */
  constructor(name: string) {
    this._name = name;
    this._models = new Map<string, IModel>();
    
    logger.debug(`Context created: ${name}`);
  }
  
  /**
   * Get the context name
   */
  get name(): string {
    return this._name;
  }
  
  /**
   * Register a model with this context
   * @param model Model to register
   */
  registerModel(model: IModel): void {
    const modelName = model.name || model.id || 'unknown';
    
    if (this._models.has(modelName)) {
      logger.warn(`Model with name ${modelName} already registered, replacing`);
    }
    
    this._models.set(modelName, model);
    logger.debug(`Model ${modelName} registered with context ${this._name}`);
  }
  
  /**
   * Unregister a model from this context
   * @param modelName Name of the model to unregister
   * @returns true if the model was found and removed, false otherwise
   */
  unregisterModel(modelName: string): boolean {
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
  getModel(modelName: string): IModel | undefined {
    return this._models.get(modelName);
  }
  
  /**
   * Get all models in this context
   * @returns Array of all registered models
   */
  getAllModels(): IModel[] {
    return Array.from(this._models.values());
  }
  
  /**
   * Get a combined state from all models
   * @returns Combined state object with model names as keys
   */
  getState(): Record<string, ModelState> {
    const state: Record<string, ModelState> = {};
    
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
  getValue<T>(modelName: string, key: string, defaultValue?: T): T | undefined {
    const model = this._models.get(modelName);
    
    if (!model) {
      return defaultValue;
    }
    
    return model.getValue<T>(key, defaultValue);
  }
  
  /**
   * Set a value in a model in this context
   * @param modelName Name of the model
   * @param key Key in the model state
   * @param value Value to set
   * @returns true if the model was found and updated, false otherwise
   */
  setValue(modelName: string, key: string, value: any): boolean {
    const model = this._models.get(modelName);
    
    if (!model) {
      return false;
    }
    
    model.setValue(key, value);
    return true;
  }
} 