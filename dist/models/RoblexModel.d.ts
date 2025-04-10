/// <reference types="node" />
import { EventEmitter } from 'events';
import { ModelState, ChangeListener, BatchChangeListener, PropertyChangeListener, ResetListener, IModel } from './types.js';
/**
 * Base model class for Roblex studio components
 * Implements the Model part of Model-Context-Protocol pattern
 */
export declare class RoblexModel extends EventEmitter implements IModel {
    private _state;
    private _name;
    private _eventHandlers;
    /**
     * Create a new model instance
     * @param name Model name for identification
     * @param initialState Initial state to populate the model
     */
    constructor(name: string, initialState?: ModelState);
    /**
     * Get the model name
     */
    get name(): string;
    /**
     * Get the current state
     */
    get state(): ModelState;
    /**
     * Get a specific state value
     * @param key State key
     * @param defaultValue Default value if key doesn't exist
     */
    getValue<T>(key: string, defaultValue?: T): T;
    /**
     * Update a single value in the state
     * @param key State key
     * @param value New value
     * @param silent If true, don't emit change events
     */
    setValue(key: string, value: any, silent?: boolean): void;
    /**
     * Update multiple values in the state
     * @param values Object with key-value pairs to update
     * @param silent If true, don't emit change events
     */
    setValues(values: ModelState, silent?: boolean): void;
    /**
     * Reset the model state
     * @param newState New state to set (empty object if not provided)
     * @param silent If true, don't emit change events
     */
    reset(newState?: ModelState, silent?: boolean): void;
    /**
     * Clear all values from the model
     */
    clear(): void;
    /**
     * Register a listener for changes to a specific property
     * @param key Property name to listen for changes
     * @param callback Callback function that receives old and new values
     */
    onPropertyChange(key: string, callback: PropertyChangeListener): void;
    /**
     * Remove a property change listener
     * @param key Property name
     * @param callback Callback function to remove
     */
    offPropertyChange(key: string, callback: PropertyChangeListener): void;
    /**
     * Register a listener for batch changes
     * @param callback Callback function that receives array of changes
     */
    onBatchChange(callback: BatchChangeListener): void;
    /**
     * Remove a batch change listener
     * @param callback Callback function to remove
     */
    offBatchChange(callback: BatchChangeListener): void;
    /**
     * Register a listener for any change
     * @param callback Callback function for changes
     */
    onChange(callback: ChangeListener): void;
    /**
     * Remove a change listener
     * @param callback Callback function to remove
     */
    offChange(callback: ChangeListener): void;
    /**
     * Register a listener for model reset
     * @param callback Callback function for reset
     */
    onReset(callback: ResetListener): void;
    /**
     * Remove a reset listener
     * @param callback Callback function to remove
     */
    offReset(callback: ResetListener): void;
    /**
     * Notify all change listeners
     * @param changeEvent Change event data
     * @private
     */
    private _notifyChange;
    /**
     * Notify all property change listeners for a specific key
     * @param key Property key
     * @param oldValue Old value
     * @param newValue New value
     * @private
     */
    private _notifyPropertyChange;
    /**
     * Notify all batch change listeners
     * @param changes Batch changes
     * @private
     */
    private _notifyBatchChange;
    /**
     * Notify all reset listeners
     * @param resetEvent Reset event data
     * @private
     */
    private _notifyReset;
}
