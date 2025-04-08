import { RoblexModel } from './RoblexModel.js';
import { ModelState } from './types.js';
/**
 * Specialized model for game-related components
 * Extends the base MCP Model with game-specific functionality
 */
export declare class RoblexGameModel extends RoblexModel {
    /**
     * Create a new game model
     * @param name Model name
     * @param initialState Initial state with game-specific properties
     */
    constructor(name: string, initialState?: ModelState);
    /**
     * Set the position of this game object
     * @param x X coordinate
     * @param y Y coordinate
     * @param z Z coordinate
     */
    setPosition(x: number, y: number, z: number): void;
    /**
     * Get the current position
     * @returns Position vector {x, y, z}
     */
    getPosition(): {
        x: number;
        y: number;
        z: number;
    };
    /**
     * Set the rotation of this game object
     * @param x X rotation in degrees
     * @param y Y rotation in degrees
     * @param z Z rotation in degrees
     */
    setRotation(x: number, y: number, z: number): void;
    /**
     * Get the current rotation
     * @returns Rotation vector {x, y, z} in degrees
     */
    getRotation(): {
        x: number;
        y: number;
        z: number;
    };
    /**
     * Set the scale of this game object
     * @param x X scale factor
     * @param y Y scale factor
     * @param z Z scale factor
     */
    setScale(x: number, y: number, z: number): void;
    /**
     * Get the current scale
     * @returns Scale vector {x, y, z}
     */
    getScale(): {
        x: number;
        y: number;
        z: number;
    };
    /**
     * Set the parent of this game object
     * @param parent Parent name or path
     */
    setParent(parent: string): void;
    /**
     * Get the parent of this game object
     * @returns Parent name or path
     */
    getParent(): string;
    /**
     * Add a child to this game object
     * @param childName Name of the child object
     */
    addChild(childName: string): void;
    /**
     * Remove a child from this game object
     * @param childName Name of the child object
     */
    removeChild(childName: string): void;
    /**
     * Set an attribute on this game object
     * @param name Attribute name
     * @param value Attribute value
     */
    setAttribute(name: string, value: any): void;
    /**
     * Get an attribute from this game object
     * @param name Attribute name
     * @param defaultValue Default value if attribute doesn't exist
     */
    getAttribute<T>(name: string, defaultValue?: T): T;
    /**
     * Set visibility of this game object
     * @param visible Visibility state
     */
    setVisible(visible: boolean): void;
    /**
     * Check if this game object is visible
     * @returns true if visible, false otherwise
     */
    isVisible(): boolean;
    /**
     * Set enabled state of this game object
     * @param enabled Enabled state
     */
    setEnabled(enabled: boolean): void;
    /**
     * Check if this game object is enabled
     * @returns true if enabled, false otherwise
     */
    isEnabled(): boolean;
}
