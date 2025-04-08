import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';
/**
 * Base model class for MCP (Model-Context-Protocol) implementation
 * This implementation provides core functionality similar to the SDK's BaseModel
 * but without external dependencies
 */
export class BaseModel extends EventEmitter {
    _state;
    _id;
    /**
     * Create a new model
     * @param id Unique identifier for the model
     */
    constructor(id) {
        super();
        this._id = id;
        this._state = {};
        logger.debug(`BaseModel created: ${id}`);
    }
    /**
     * Get the model's unique identifier
     */
    get id() {
        return this._id;
    }
    /**
     * Get the full state object
     */
    get state() {
        return { ...this._state };
    }
    /**
     * Set a value in the model's state
     * @param key State property key
     * @param value Value to set
     */
    setValue(key, value) {
        const oldValue = this._state[key];
        this._state[key] = value;
        // Emit change events
        this.emit('change', { key, value, oldValue });
        this.emit(`change:${key}`, value, oldValue);
    }
    /**
     * Set multiple values at once
     * @param values Object with key-value pairs to set
     */
    setValues(values) {
        const changes = {};
        // Collect all changes
        Object.entries(values).forEach(([key, value]) => {
            const oldValue = this._state[key];
            this._state[key] = value;
            changes[key] = { oldValue, newValue: value };
        });
        // Emit batch change event
        this.emit('batchChange', changes);
        // Emit individual change events
        Object.entries(changes).forEach(([key, { newValue, oldValue }]) => {
            this.emit('change', { key, value: newValue, oldValue });
            this.emit(`change:${key}`, newValue, oldValue);
        });
    }
    /**
     * Get a value from the state
     * @param key State property key
     * @param defaultValue Default value if key doesn't exist
     * @returns The value or defaultValue if not found
     */
    getValue(key, defaultValue) {
        return this._state[key] ?? defaultValue;
    }
    /**
     * Reset the model state
     * @param newState Optional new state to set after reset
     */
    reset(newState) {
        const oldState = { ...this._state };
        this._state = {};
        if (newState) {
            Object.entries(newState).forEach(([key, value]) => {
                this._state[key] = value;
            });
        }
        this.emit('reset', { oldState, newState: this._state });
    }
    /**
     * Check if the model has a property
     * @param key Property key to check
     * @returns true if the property exists
     */
    has(key) {
        return key in this._state;
    }
}
//# sourceMappingURL=BaseModel.js.map