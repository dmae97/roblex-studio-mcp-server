export * from './RoblexModel.js';
export * from './RoblexContext.js';
export * from './RoblexProtocol.js';
export * from './RoblexGameModel.js';
export * from './RoblexStudioModels.js';
export * from './RoblexStudioAdapter.js';
export * from './types.js';
import { RoblexContext } from './RoblexContext.js';
import { RoblexModel } from './RoblexModel.js';
import { RoblexProtocol } from './RoblexProtocol.js';
import { RoblexGameModel } from './RoblexGameModel.js';
import { RoblexStudioScriptModel, RoblexStudioUIModel, RoblexStudioServiceModel } from './RoblexStudioModels.js';
import { RoblexStudioAdapter } from './RoblexStudioAdapter.js';
import { ModelState } from './types.js';
/**
 * Create a complete MCP (Model-Context-Protocol) setup
 * @param name Base name for the MCP components
 * @param initialState Optional initial state for the model
 * @returns Object containing the created model, context, and protocol
 */
export declare function createMcp(name: string, initialState?: ModelState): {
    model: RoblexModel;
    context: RoblexContext;
    protocol: RoblexProtocol;
};
/**
 * Create a specialized MCP for game objects
 * @param objectName Name of the game object
 * @param objectType Type of game object (e.g., 'player', 'npc', 'item')
 * @param initialProperties Initial properties for the object
 * @returns MCP components for the game object
 */
export declare function createGameObjectMcp(objectName: string, objectType: string, initialProperties?: ModelState): {
    model: RoblexGameModel;
    context: RoblexContext;
    protocol: RoblexProtocol;
};
/**
 * Create specialized MCP for UI components
 * @param componentName Name of the UI component
 * @param componentType Type of UI component (e.g., 'button', 'panel', 'menu')
 * @param initialProperties Initial properties for the component
 * @returns MCP components for the UI component
 */
export declare function createUiComponentMcp(componentName: string, componentType: string, initialProperties?: ModelState): {
    model: RoblexModel;
    context: RoblexContext;
    protocol: RoblexProtocol;
};
/**
 * Create a specialized MCP for Roblox Studio scripts
 * @param scriptName Name of the script
 * @param scriptType Type of script (Script, LocalScript, or ModuleScript)
 * @param source Initial source code
 * @param parent Parent container
 * @returns MCP components for the script
 */
export declare function createRoblexStudioScriptMcp(scriptName: string, scriptType?: string, source?: string, parent?: string): {
    model: RoblexStudioScriptModel;
    context: RoblexContext;
    protocol: RoblexProtocol;
};
/**
 * Create a specialized MCP for Roblox Studio UI elements
 * @param uiName Name of the UI element
 * @param className Class name of the UI element
 * @param initialProperties Initial properties
 * @returns MCP components for the UI element
 */
export declare function createRoblexStudioUIMcp(uiName: string, className?: string, initialProperties?: ModelState): {
    model: RoblexStudioUIModel;
    context: RoblexContext;
    protocol: RoblexProtocol;
};
/**
 * Create a specialized MCP for Roblox Studio services
 * @param serviceName Name of the service
 * @param initialProperties Initial properties
 * @returns MCP components for the service
 */
export declare function createRoblexStudioServiceMcp(serviceName: string, initialProperties?: ModelState): {
    model: RoblexStudioServiceModel;
    context: RoblexContext;
    protocol: RoblexProtocol;
};
/**
 * The global context that manages all top-level models
 */
export declare const globalContext: RoblexContext;
/**
 * The global protocol that manages top-level message handling
 */
export declare const globalProtocol: RoblexProtocol;
/**
 * Factory for creating Roblox Studio adapters
 */
export declare const roblexStudioAdapterFactory: (connectionId: string) => RoblexStudioAdapter;
