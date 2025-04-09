/**
 * Types for the Model-Context-Protocol (MCP) implementation
 */

// Model state type
export type ModelState = Record<string, any>;

// Change event data
export interface ChangeEvent {
  key: string;
  oldValue: any;
  newValue: any;
}

// Batch change event data
export type BatchChangeEvent = Array<ChangeEvent>;

// Reset event data
export interface ResetEvent {
  oldState: ModelState;
  newState: ModelState;
}

// Property change listener
export type PropertyChangeListener = (data: { oldValue: any; newValue: any }) => void;

// Change listener
export type ChangeListener = (data: ChangeEvent) => void;

// Batch change listener
export type BatchChangeListener = (changes: BatchChangeEvent) => void;

// Reset listener
export type ResetListener = (data: ResetEvent) => void;

/**
 * Common interface for all Roblex models to ensure type compatibility
 * This helps resolve type issues when registering specialized models
 */
export interface IModel {
  id?: string;
  name?: string;
  state: ModelState;
  getValue<T>(key: string, defaultValue?: T): T;
  setValue(key: string, value: any, silent?: boolean): void;
  setValues(values: ModelState, silent?: boolean): void;
} 