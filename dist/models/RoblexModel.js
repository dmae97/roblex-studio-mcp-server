import { logger } from '../utils/logger.js';
import { EventEmitter } from 'events';
/**
 * Base model class for Roblex studio components
 * Implements the Model part of Model-Context-Protocol pattern
 */
export class RoblexModel extends EventEmitter {
    _state;
    _name;
    _eventHandlers;
    /**
     * Create a new model instance
     * @param name Model name for identification
     * @param initialState Initial state to populate the model
     */
    constructor(name, initialState = {}) {
        super();
        this._name = name;
        this._state = { ...initialState };
        this._eventHandlers = {
            change: [],
            reset: [],
            batchChange: [],
            propertyChange: {}
        };
        logger.debug(`Model created: ${name}`);
    }
    /**
     * Get the model name
     */
    get name() {
        return this._name;
    }
    /**
     * Get the current state
     */
    get state() {
        return { ...this._state };
    }
    /**
     * Get a specific state value
     * @param key State key
     * @param defaultValue Default value if key doesn't exist
     */
    getValue(key, defaultValue) {
        return this._state[key] ?? defaultValue;
    }
    /**
     * Update a single value in the state
     * @param key State key
     * @param value New value
     * @param silent If true, don't emit change events
     */
    setValue(key, value, silent = false) {
        const oldValue = this._state[key];
        this._state[key] = value;
        if (!silent && oldValue !== value) {
            const changeEvent = { key, oldValue, newValue: value };
            this._notifyChange(changeEvent);
            this._notifyPropertyChange(key, oldValue, value);
            // Also emit for EventEmitter compatibility
            this.emit('change', { key, value, previousValue: oldValue });
        }
    }
    /**
     * Update multiple values in the state
     * @param values Object with key-value pairs to update
     * @param silent If true, don't emit change events
     */
    setValues(values, silent = false) {
        const changes = [];
        Object.entries(values).forEach(([key, value]) => {
            const oldValue = this._state[key];
            this._state[key] = value;
            if (!silent && oldValue !== value) {
                changes.push({ key, oldValue, newValue: value });
                // Also emit for EventEmitter compatibility
                this.emit('change', { key, value, previousValue: oldValue });
            }
        });
        if (!silent && changes.length > 0) {
            this._notifyBatchChange(changes);
            changes.forEach(change => {
                this._notifyPropertyChange(change.key, change.oldValue, change.newValue);
            });
            // Also emit batch event for EventEmitter compatibility
            this.emit('batchChange', changes);
        }
    }
    /**
     * Reset the model state
     * @param newState New state to set (empty object if not provided)
     * @param silent If true, don't emit change events
     */
    reset(newState = {}, silent = false) {
        const oldState = { ...this._state };
        this._state = { ...newState };
        if (!silent) {
            const resetEvent = { oldState, newState: this._state };
            this._notifyReset(resetEvent);
            // Also emit for EventEmitter compatibility
            this.emit('reset', resetEvent);
        }
    }
    /**
     * Clear all values from the model
     */
    clear() {
        this.reset({});
    }
    /**
     * Register a listener for changes to a specific property
     * @param key Property name to listen for changes
     * @param callback Callback function that receives old and new values
     */
    onPropertyChange(key, callback) {
        if (!this._eventHandlers.propertyChange[key]) {
            this._eventHandlers.propertyChange[key] = [];
        }
        this._eventHandlers.propertyChange[key].push(callback);
    }
    /**
     * Remove a property change listener
     * @param key Property name
     * @param callback Callback function to remove
     */
    offPropertyChange(key, callback) {
        if (this._eventHandlers.propertyChange[key]) {
            this._eventHandlers.propertyChange[key] = this._eventHandlers.propertyChange[key].filter(handler => handler !== callback);
        }
    }
    /**
     * Register a listener for batch changes
     * @param callback Callback function that receives array of changes
     */
    onBatchChange(callback) {
        this._eventHandlers.batchChange.push(callback);
    }
    /**
     * Remove a batch change listener
     * @param callback Callback function to remove
     */
    offBatchChange(callback) {
        this._eventHandlers.batchChange = this._eventHandlers.batchChange.filter(handler => handler !== callback);
    }
    /**
     * Register a listener for any change
     * @param callback Callback function for changes
     */
    onChange(callback) {
        this._eventHandlers.change.push(callback);
    }
    /**
     * Remove a change listener
     * @param callback Callback function to remove
     */
    offChange(callback) {
        this._eventHandlers.change = this._eventHandlers.change.filter(handler => handler !== callback);
    }
    /**
     * Register a listener for model reset
     * @param callback Callback function for reset
     */
    onReset(callback) {
        this._eventHandlers.reset.push(callback);
    }
    /**
     * Remove a reset listener
     * @param callback Callback function to remove
     */
    offReset(callback) {
        this._eventHandlers.reset = this._eventHandlers.reset.filter(handler => handler !== callback);
    }
    /**
     * Notify all change listeners
     * @param changeEvent Change event data
     * @private
     */
    _notifyChange(changeEvent) {
        this._eventHandlers.change.forEach(handler => handler(changeEvent));
    }
    /**
     * Notify all property change listeners for a specific key
     * @param key Property key
     * @param oldValue Old value
     * @param newValue New value
     * @private
     */
    _notifyPropertyChange(key, oldValue, newValue) {
        if (this._eventHandlers.propertyChange[key]) {
            this._eventHandlers.propertyChange[key].forEach(handler => handler({ oldValue, newValue }));
        }
    }
    /**
     * Notify all batch change listeners
     * @param changes Batch changes
     * @private
     */
    _notifyBatchChange(changes) {
        this._eventHandlers.batchChange.forEach(handler => handler(changes));
    }
    /**
     * Notify all reset listeners
     * @param resetEvent Reset event data
     * @private
     */
    _notifyReset(resetEvent) {
        this._eventHandlers.reset.forEach(handler => handler(resetEvent));
    }
}
//# sourceMappingURL=RoblexModel.js.map