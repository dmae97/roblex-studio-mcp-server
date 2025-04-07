import { RoblexModel } from './RoblexModel.js';
import { ModelState } from './types.js';
import { logger } from '../utils/logger.js';

/**
 * Specialized model for game-related components
 * Extends the base MCP Model with game-specific functionality
 */
export class RoblexGameModel extends RoblexModel {
  /**
   * Create a new game model
   * @param name Model name
   * @param initialState Initial state with game-specific properties
   */
  constructor(name: string, initialState: ModelState = {}) {
    // Add default game properties if not provided
    const gameState: ModelState = {
      enabled: true,
      visible: true,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      className: 'Instance',
      parent: 'Workspace',
      children: [],
      attributes: {},
      ...initialState
    };
    
    super(name, gameState);
    logger.debug(`Game model created: ${name}`);
  }
  
  /**
   * Set the position of this game object
   * @param x X coordinate
   * @param y Y coordinate
   * @param z Z coordinate
   */
  setPosition(x: number, y: number, z: number): void {
    this.setValue('position', { x, y, z });
  }
  
  /**
   * Get the current position
   * @returns Position vector {x, y, z}
   */
  getPosition(): { x: number; y: number; z: number } {
    return this.getValue<{ x: number; y: number; z: number }>('position', { x: 0, y: 0, z: 0 });
  }
  
  /**
   * Set the rotation of this game object
   * @param x X rotation in degrees
   * @param y Y rotation in degrees
   * @param z Z rotation in degrees
   */
  setRotation(x: number, y: number, z: number): void {
    this.setValue('rotation', { x, y, z });
  }
  
  /**
   * Get the current rotation
   * @returns Rotation vector {x, y, z} in degrees
   */
  getRotation(): { x: number; y: number; z: number } {
    return this.getValue<{ x: number; y: number; z: number }>('rotation', { x: 0, y: 0, z: 0 });
  }
  
  /**
   * Set the scale of this game object
   * @param x X scale factor
   * @param y Y scale factor
   * @param z Z scale factor
   */
  setScale(x: number, y: number, z: number): void {
    this.setValue('scale', { x, y, z });
  }
  
  /**
   * Get the current scale
   * @returns Scale vector {x, y, z}
   */
  getScale(): { x: number; y: number; z: number } {
    return this.getValue<{ x: number; y: number; z: number }>('scale', { x: 1, y: 1, z: 1 });
  }
  
  /**
   * Set the parent of this game object
   * @param parent Parent name or path
   */
  setParent(parent: string): void {
    this.setValue('parent', parent);
  }
  
  /**
   * Get the parent of this game object
   * @returns Parent name or path
   */
  getParent(): string {
    return this.getValue<string>('parent', 'Workspace');
  }
  
  /**
   * Add a child to this game object
   * @param childName Name of the child object
   */
  addChild(childName: string): void {
    const children = this.getValue<string[]>('children', []);
    if (!children.includes(childName)) {
      this.setValue('children', [...children, childName]);
    }
  }
  
  /**
   * Remove a child from this game object
   * @param childName Name of the child object
   */
  removeChild(childName: string): void {
    const children = this.getValue<string[]>('children', []);
    this.setValue('children', children.filter(child => child !== childName));
  }
  
  /**
   * Set an attribute on this game object
   * @param name Attribute name
   * @param value Attribute value
   */
  setAttribute(name: string, value: any): void {
    const attributes = this.getValue<Record<string, any>>('attributes', {});
    this.setValue('attributes', { ...attributes, [name]: value });
  }
  
  /**
   * Get an attribute from this game object
   * @param name Attribute name
   * @param defaultValue Default value if attribute doesn't exist
   */
  getAttribute<T>(name: string, defaultValue?: T): T {
    const attributes = this.getValue<Record<string, any>>('attributes', {});
    return (attributes[name] as T) ?? defaultValue as T;
  }
  
  /**
   * Set visibility of this game object
   * @param visible Visibility state
   */
  setVisible(visible: boolean): void {
    this.setValue('visible', visible);
  }
  
  /**
   * Check if this game object is visible
   * @returns true if visible, false otherwise
   */
  isVisible(): boolean {
    return this.getValue<boolean>('visible', true);
  }
  
  /**
   * Set enabled state of this game object
   * @param enabled Enabled state
   */
  setEnabled(enabled: boolean): void {
    this.setValue('enabled', enabled);
  }
  
  /**
   * Check if this game object is enabled
   * @returns true if enabled, false otherwise
   */
  isEnabled(): boolean {
    return this.getValue<boolean>('enabled', true);
  }
} 