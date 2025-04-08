/**
 * Types for the Model-Context-Protocol (MCP) implementation
 */
export type ModelState = Record<string, any>;
export interface ChangeEvent {
    key: string;
    oldValue: any;
    newValue: any;
}
export type BatchChangeEvent = Array<ChangeEvent>;
export interface ResetEvent {
    oldState: ModelState;
    newState: ModelState;
}
export type PropertyChangeListener = (data: {
    oldValue: any;
    newValue: any;
}) => void;
export type ChangeListener = (data: ChangeEvent) => void;
export type BatchChangeListener = (changes: BatchChangeEvent) => void;
export type ResetListener = (data: ResetEvent) => void;
