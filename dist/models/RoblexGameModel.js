"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoblexGameModel = void 0;
const RoblexModel_js_1 = require("./RoblexModel.js");
const logger_js_1 = require("../utils/logger.js");
/**
 * Specialized model for game-related components
 * Extends the base MCP Model with game-specific functionality
 */
class RoblexGameModel extends RoblexModel_js_1.RoblexModel {
    /**
     * Create a new game model
     * @param name Model name
     * @param initialState Initial state with game-specific properties
     */
    constructor(name, initialState = {}) {
        // Add default game properties if not provided
        const gameState = {
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
        logger_js_1.logger.debug(`Game model created: ${name}`);
    }
    /**
     * Set the position of this game object
     * @param x X coordinate
     * @param y Y coordinate
     * @param z Z coordinate
     */
    setPosition(x, y, z) {
        this.setValue('position', { x, y, z });
    }
    /**
     * Get the current position
     * @returns Position vector {x, y, z}
     */
    getPosition() {
        return this.getValue('position', { x: 0, y: 0, z: 0 });
    }
    /**
     * Set the rotation of this game object
     * @param x X rotation in degrees
     * @param y Y rotation in degrees
     * @param z Z rotation in degrees
     */
    setRotation(x, y, z) {
        this.setValue('rotation', { x, y, z });
    }
    /**
     * Get the current rotation
     * @returns Rotation vector {x, y, z} in degrees
     */
    getRotation() {
        return this.getValue('rotation', { x: 0, y: 0, z: 0 });
    }
    /**
     * Set the scale of this game object
     * @param x X scale factor
     * @param y Y scale factor
     * @param z Z scale factor
     */
    setScale(x, y, z) {
        this.setValue('scale', { x, y, z });
    }
    /**
     * Get the current scale
     * @returns Scale vector {x, y, z}
     */
    getScale() {
        return this.getValue('scale', { x: 1, y: 1, z: 1 });
    }
    /**
     * Set the parent of this game object
     * @param parent Parent name or path
     */
    setParent(parent) {
        this.setValue('parent', parent);
    }
    /**
     * Get the parent of this game object
     * @returns Parent name or path
     */
    getParent() {
        return this.getValue('parent', 'Workspace');
    }
    /**
     * Add a child to this game object
     * @param childName Name of the child object
     */
    addChild(childName) {
        const children = this.getValue('children', []);
        if (!children.includes(childName)) {
            this.setValue('children', [...children, childName]);
        }
    }
    /**
     * Remove a child from this game object
     * @param childName Name of the child object
     */
    removeChild(childName) {
        const children = this.getValue('children', []);
        this.setValue('children', children.filter(child => child !== childName));
    }
    /**
     * Set an attribute on this game object
     * @param name Attribute name
     * @param value Attribute value
     */
    setAttribute(name, value) {
        const attributes = this.getValue('attributes', {});
        this.setValue('attributes', { ...attributes, [name]: value });
    }
    /**
     * Get an attribute from this game object
     * @param name Attribute name
     * @param defaultValue Default value if attribute doesn't exist
     */
    getAttribute(name, defaultValue) {
        const attributes = this.getValue('attributes', {});
        return attributes[name] ?? defaultValue;
    }
    /**
     * Set visibility of this game object
     * @param visible Visibility state
     */
    setVisible(visible) {
        this.setValue('visible', visible);
    }
    /**
     * Check if this game object is visible
     * @returns true if visible, false otherwise
     */
    isVisible() {
        return this.getValue('visible', true);
    }
    /**
     * Set enabled state of this game object
     * @param enabled Enabled state
     */
    setEnabled(enabled) {
        this.setValue('enabled', enabled);
    }
    /**
     * Check if this game object is enabled
     * @returns true if enabled, false otherwise
     */
    isEnabled() {
        return this.getValue('enabled', true);
    }
}
exports.RoblexGameModel = RoblexGameModel;
//# sourceMappingURL=RoblexGameModel.js.map