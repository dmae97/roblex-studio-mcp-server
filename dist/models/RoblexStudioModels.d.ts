import { BaseModel } from './BaseModel.js';
import { ModelState } from './types.js';
/**
 * Roblox Studio 모델 클래스
 * 스크립트, UI, 서비스 등 Roblox Studio의 다양한 요소를 표현합니다.
 */
export declare class RoblexStudioBaseModel extends BaseModel {
    constructor(id: string, initialState?: Record<string, unknown>);
    protected getModelType(): 'script' | 'ui' | 'service' | null;
    setValue(key: string, value: unknown): void;
    setValues(values: Record<string, unknown>): void;
    getValue<T>(key: string, defaultValue?: T): T;
}
/**
 * Specialized model for Roblox Studio script objects
 */
export declare class RoblexStudioScriptModel extends RoblexStudioBaseModel {
    /**
     * Create a new Roblox Studio script model
     * @param id Script ID (usually the name)
     * @param initialState Initial script properties
     */
    constructor(id: string, initialState?: ModelState);
    /**
     * Get the script source code
     * @returns Source code as string
     */
    getSource(): string;
    /**
     * Set the script source code
     * @param source New source code
     */
    setSource(source: string): void;
    /**
     * Get the script type
     * @returns Script type (Script, LocalScript, or ModuleScript)
     */
    getScriptType(): string;
    /**
     * Set the script type
     * @param scriptType New script type (Script, LocalScript, or ModuleScript)
     */
    setScriptType(scriptType: string): void;
    /**
     * Get the run context
     * @returns Run context (Server, Client, or Legacy)
     */
    getRunContext(): string;
    /**
     * Set the run context
     * @param runContext New run context (Server, Client, or Legacy)
     */
    setRunContext(runContext: string): void;
    /**
     * Check if the script is enabled
     * @returns true if enabled, false otherwise
     */
    isEnabled(): boolean;
    /**
     * Set the enabled state of the script
     * @param enabled New enabled state
     */
    setEnabled(enabled: boolean): void;
    /**
     * Get the parent of the script
     * @returns Parent name or path
     */
    getParent(): string;
    /**
     * Set the parent of the script
     * @param parent New parent name or path
     */
    setParent(parent: string): void;
}
/**
 * Specialized model for Roblox Studio UI objects
 */
export declare class RoblexStudioUIModel extends RoblexStudioBaseModel {
    /**
     * Create a new Roblox Studio UI model
     * @param id UI element ID (usually the name)
     * @param initialState Initial UI properties
     */
    constructor(id: string, initialState?: ModelState);
    /**
     * Get the UI class name
     * @returns Class name
     */
    getClassName(): string;
    /**
     * Set the UI class name
     * @param className New class name
     */
    setClassName(className: string): void;
    /**
     * Get the size of the UI element
     * @returns Size as {x, y}
     */
    getSize(): {
        x: number;
        y: number;
    };
    /**
     * Set the size of the UI element
     * @param x Width
     * @param y Height
     */
    setSize(x: number, y: number): void;
    /**
     * Get the position of the UI element
     * @returns Position as {x, y}
     */
    getPosition(): {
        x: number;
        y: number;
    };
    /**
     * Set the position of the UI element
     * @param x X coordinate
     * @param y Y coordinate
     */
    setPosition(x: number, y: number): void;
    /**
     * Get the anchor point of the UI element
     * @returns Anchor point as {x, y}
     */
    getAnchorPoint(): {
        x: number;
        y: number;
    };
    /**
     * Set the anchor point of the UI element
     * @param x X anchor (0-1)
     * @param y Y anchor (0-1)
     */
    setAnchorPoint(x: number, y: number): void;
    /**
     * Check if the UI element is visible
     * @returns true if visible, false otherwise
     */
    isVisible(): boolean;
    /**
     * Set the visibility of the UI element
     * @param visible New visibility state
     */
    setVisible(visible: boolean): void;
    /**
     * Get the Z-index of the UI element
     * @returns Z-index value
     */
    getZIndex(): number;
    /**
     * Set the Z-index of the UI element
     * @param zIndex New Z-index value
     */
    setZIndex(zIndex: number): void;
    /**
     * Get a specific UI property
     * @param propertyName Property name
     * @param defaultValue Default value if property doesn't exist
     * @returns Property value
     */
    getProperty<T>(propertyName: string, defaultValue?: T): T;
    /**
     * Set a specific UI property
     * @param propertyName Property name
     * @param value Property value
     */
    setProperty(propertyName: string, value: unknown): void;
    /**
     * Add a child to this UI element
     * @param childName Child name
     */
    addChild(childName: string): void;
    /**
     * Remove a child from this UI element
     * @param childName Child name
     */
    removeChild(childName: string): void;
}
/**
 * Specialized model for Roblox Studio service objects
 */
export declare class RoblexStudioServiceModel extends RoblexStudioBaseModel {
    /**
     * Create a new Roblox Studio service model
     * @param id Service ID (usually the name)
     * @param initialState Initial service properties
     */
    constructor(id: string, initialState?: ModelState);
    /**
     * Get the service name
     * @returns Service name
     */
    getServiceName(): string;
    /**
     * Get a specific service property
     * @param propertyName Property name
     * @param defaultValue Default value if property doesn't exist
     * @returns Property value
     */
    getProperty<T>(propertyName: string, defaultValue?: T): T;
    /**
     * Set a specific service property
     * @param propertyName Property name
     * @param value Property value
     */
    setProperty(propertyName: string, value: unknown): void;
    /**
     * Add a child to this service
     * @param childName Child name
     */
    addChild(childName: string): void;
    /**
     * Remove a child from this service
     * @param childName Child name
     */
    removeChild(childName: string): void;
}
