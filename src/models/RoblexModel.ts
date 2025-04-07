import { logger } from '../utils/logger.js';
import { EventEmitter } from 'events';
import { 
  ModelState, 
  ChangeEvent, 
  BatchChangeEvent, 
  ResetEvent,
  ChangeListener,
  BatchChangeListener,
  PropertyChangeListener,
  ResetListener
} from './types.js';

/**
 * Base model class for Roblex studio components
 * Implements the Model part of Model-Context-Protocol pattern
 */
export class RoblexModel extends EventEmitter {
  private _state: ModelState;
  private _name: string;
  private _eventHandlers: {
    change: ChangeListener[];
    reset: ResetListener[];
    batchChange: BatchChangeListener[];
    propertyChange: Record<string, PropertyChangeListener[]>;
  };
  
  /**
   * Create a new model instance
   * @param name Model name for identification
   * @param initialState Initial state to populate the model
   */
  constructor(name: string, initialState: ModelState = {}) {
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
  get name(): string {
    return this._name;
  }
  
  /**
   * Get the current state
   */
  get state(): ModelState {
    return { ...this._state };
  }
  
  /**
   * Get a specific state value
   * @param key State key
   * @param defaultValue Default value if key doesn't exist
   */
  getValue<T>(key: string, defaultValue?: T): T {
    return (this._state[key] as T) ?? defaultValue as T;
  }
  
  /**
   * Update a single value in the state
   * @param key State key
   * @param value New value
   * @param silent If true, don't emit change events
   */
  setValue(key: string, value: any, silent: boolean = false): void {
    const oldValue = this._state[key];
    this._state[key] = value;
    
    if (!silent && oldValue !== value) {
      const changeEvent: ChangeEvent = { key, oldValue, newValue: value };
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
  setValues(values: ModelState, silent: boolean = false): void {
    const changes: BatchChangeEvent = [];
    
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
  reset(newState: ModelState = {}, silent: boolean = false): void {
    const oldState = { ...this._state };
    this._state = { ...newState };
    
    if (!silent) {
      const resetEvent: ResetEvent = { oldState, newState: this._state };
      this._notifyReset(resetEvent);
      
      // Also emit for EventEmitter compatibility
      this.emit('reset', resetEvent);
    }
  }
  
  /**
   * Clear all values from the model
   */
  clear(): void {
    this.reset({});
  }
  
  /**
   * Register a listener for changes to a specific property
   * @param key Property name to listen for changes
   * @param callback Callback function that receives old and new values
   */
  onPropertyChange(key: string, callback: PropertyChangeListener): void {
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
  offPropertyChange(key: string, callback: PropertyChangeListener): void {
    if (this._eventHandlers.propertyChange[key]) {
      this._eventHandlers.propertyChange[key] = this._eventHandlers.propertyChange[key].filter(
        handler => handler !== callback
      );
    }
  }
  
  /**
   * Register a listener for batch changes
   * @param callback Callback function that receives array of changes
   */
  onBatchChange(callback: BatchChangeListener): void {
    this._eventHandlers.batchChange.push(callback);
  }
  
  /**
   * Remove a batch change listener
   * @param callback Callback function to remove
   */
  offBatchChange(callback: BatchChangeListener): void {
    this._eventHandlers.batchChange = this._eventHandlers.batchChange.filter(
      handler => handler !== callback
    );
  }
  
  /**
   * Register a listener for any change
   * @param callback Callback function for changes
   */
  onChange(callback: ChangeListener): void {
    this._eventHandlers.change.push(callback);
  }
  
  /**
   * Remove a change listener
   * @param callback Callback function to remove
   */
  offChange(callback: ChangeListener): void {
    this._eventHandlers.change = this._eventHandlers.change.filter(
      handler => handler !== callback
    );
  }
  
  /**
   * Register a listener for model reset
   * @param callback Callback function for reset
   */
  onReset(callback: ResetListener): void {
    this._eventHandlers.reset.push(callback);
  }
  
  /**
   * Remove a reset listener
   * @param callback Callback function to remove
   */
  offReset(callback: ResetListener): void {
    this._eventHandlers.reset = this._eventHandlers.reset.filter(
      handler => handler !== callback
    );
  }
  
  /**
   * Notify all change listeners
   * @param changeEvent Change event data
   * @private
   */
  private _notifyChange(changeEvent: ChangeEvent): void {
    this._eventHandlers.change.forEach(handler => handler(changeEvent));
  }
  
  /**
   * Notify all property change listeners for a specific key
   * @param key Property key
   * @param oldValue Old value
   * @param newValue New value
   * @private
   */
  private _notifyPropertyChange(key: string, oldValue: any, newValue: any): void {
    if (this._eventHandlers.propertyChange[key]) {
      this._eventHandlers.propertyChange[key].forEach(handler => 
        handler({ oldValue, newValue })
      );
    }
  }
  
  /**
   * Notify all batch change listeners
   * @param changes Batch changes
   * @private
   */
  private _notifyBatchChange(changes: BatchChangeEvent): void {
    this._eventHandlers.batchChange.forEach(handler => handler(changes));
  }
  
  /**
   * Notify all reset listeners
   * @param resetEvent Reset event data
   * @private
   */
  private _notifyReset(resetEvent: ResetEvent): void {
    this._eventHandlers.reset.forEach(handler => handler(resetEvent));
  }
} 