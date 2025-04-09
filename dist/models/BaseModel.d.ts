/// <reference types="node" />
import { EventEmitter } from 'events';
import { IModel } from './types.js';
/**
 * Base model class for MCP (Model-Context-Protocol) implementation
 * This implementation provides core functionality similar to the SDK's BaseModel
 * but without external dependencies
 */
export declare class BaseModel extends EventEmitter implements IModel {
    protected _state: Record<string, unknown>;
    protected _id: string;
    /**
     * Create a new model
     * @param id Unique identifier for the model
     */
    constructor(id: string);
    /**
     * Get the model's unique identifier
     */
    get id(): string;
    /**
     * Get the full state object
     */
    get state(): Record<string, unknown>;
    /**
     * Set a value in the model's state
     * @param key State property key
     * @param value Value to set
     */
    setValue(key: string, value: unknown): void;
    /**
     * Set multiple values at once
     * @param values Object with key-value pairs to set
     */
    setValues(values: Record<string, unknown>): void;
    /**
     * Get a value from the state
     * @param key State property key
     * @param defaultValue Default value if key doesn't exist
     * @returns The value or defaultValue if not found
     */
    getValue<T>(key: string, defaultValue?: T): T;
    /**
     * Reset the model state
     * @param newState Optional new state to set after reset
     */
    reset(newState?: Record<string, unknown>): void;
    /**
     * Check if the model has a property
     * @param key Property key to check
     * @returns true if the property exists
     */
    has(key: string): boolean;
}
