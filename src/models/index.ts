export * from './RoblexModel.js';
export * from './RoblexContext.js';
export * from './RoblexProtocol.js';
export * from './RoblexGameModel.js';
export * from './RoblexStudioModels.js';
export * from './RoblexStudioAdapter.js';
export * from './types.js';

import { logger } from '../utils/logger.js';
import { RoblexContext } from './RoblexContext.js';
import { RoblexModel } from './RoblexModel.js';
import { RoblexProtocol } from './RoblexProtocol.js';
import { RoblexGameModel } from './RoblexGameModel.js';
import { 
  RoblexStudioScriptModel, 
  RoblexStudioUIModel,
  RoblexStudioServiceModel 
} from './RoblexStudioModels.js';
import { RoblexStudioAdapter, createRoblexStudioAdapterFactory } from './RoblexStudioAdapter.js';
import { ModelState } from './types.js';

/**
 * Create a complete MCP (Model-Context-Protocol) setup
 * @param name Base name for the MCP components
 * @param initialState Optional initial state for the model
 * @returns Object containing the created model, context, and protocol
 */
export function createMcp(name: string, initialState: ModelState = {}): {
  model: RoblexModel;
  context: RoblexContext;
  protocol: RoblexProtocol;
} {
  logger.debug(`Creating MCP with name: ${name}`);
  
  const model = new RoblexModel(name, initialState);
  const context = new RoblexContext(`${name}Context`);
  const protocol = new RoblexProtocol(`${name}Protocol`, context);
  
  context.registerModel(model as any);
  
  return {
    model,
    context,
    protocol
  };
}

/**
 * Create a specialized MCP for game objects
 * @param objectName Name of the game object
 * @param objectType Type of game object (e.g., 'player', 'npc', 'item')
 * @param initialProperties Initial properties for the object
 * @returns MCP components for the game object
 */
export function createGameObjectMcp(
  objectName: string,
  objectType: string,
  initialProperties: ModelState = {}
): {
  model: RoblexGameModel;
  context: RoblexContext;
  protocol: RoblexProtocol;
} {
  const initialState = {
    type: objectType,
    id: `${objectType}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    created: new Date().toISOString(),
    ...initialProperties
  };
  
  logger.debug(`Creating game object MCP: ${objectName} (${objectType})`);
  
  const model = new RoblexGameModel(`${objectType}_${objectName}`, initialState);
  const context = new RoblexContext(`${objectType}_${objectName}Context`);
  const protocol = new RoblexProtocol(`${objectType}_${objectName}Protocol`, context);
  
  context.registerModel(model as any);
  
  return {
    model,
    context,
    protocol
  };
}

/**
 * Create specialized MCP for UI components
 * @param componentName Name of the UI component
 * @param componentType Type of UI component (e.g., 'button', 'panel', 'menu')
 * @param initialProperties Initial properties for the component
 * @returns MCP components for the UI component
 */
export function createUiComponentMcp(
  componentName: string,
  componentType: string,
  initialProperties: ModelState = {}
): {
  model: RoblexModel;
  context: RoblexContext;
  protocol: RoblexProtocol;
} {
  const initialState = {
    type: componentType,
    id: `ui_${componentType}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    visible: true,
    enabled: true,
    ...initialProperties
  };
  
  return createMcp(`ui_${componentType}_${componentName}`, initialState);
}

/**
 * Create a specialized MCP for Roblox Studio scripts
 * @param scriptName Name of the script
 * @param scriptType Type of script (Script, LocalScript, or ModuleScript)
 * @param source Initial source code
 * @param parent Parent container
 * @returns MCP components for the script
 */
export function createRoblexStudioScriptMcp(
  scriptName: string,
  scriptType: string = 'Script',
  source: string = '',
  parent: string = 'ServerScriptService'
): {
  model: RoblexStudioScriptModel;
  context: RoblexContext;
  protocol: RoblexProtocol;
} {
  logger.debug(`Creating Roblox Studio script MCP: ${scriptName} (${scriptType})`);
  
  const model = new RoblexStudioScriptModel(`Script_${scriptName}`, {
    scriptType,
    source,
    parent,
    runContext: scriptType === 'LocalScript' ? 'Client' : 'Server'
  });
  
  const context = new RoblexContext(`Script_${scriptName}Context`);
  const protocol = new RoblexProtocol(`Script_${scriptName}Protocol`, context);
  
  context.registerModel(model as any);
  
  return {
    model,
    context,
    protocol
  };
}

/**
 * Create a specialized MCP for Roblox Studio UI elements
 * @param uiName Name of the UI element
 * @param className Class name of the UI element
 * @param initialProperties Initial properties
 * @returns MCP components for the UI element
 */
export function createRoblexStudioUIMcp(
  uiName: string,
  className: string = 'Frame',
  initialProperties: ModelState = {}
): {
  model: RoblexStudioUIModel;
  context: RoblexContext;
  protocol: RoblexProtocol;
} {
  logger.debug(`Creating Roblox Studio UI MCP: ${uiName} (${className})`);
  
  const model = new RoblexStudioUIModel(`UI_${uiName}`, {
    className,
    ...initialProperties
  });
  
  const context = new RoblexContext(`UI_${uiName}Context`);
  const protocol = new RoblexProtocol(`UI_${uiName}Protocol`, context);
  
  context.registerModel(model as any);
  
  return {
    model,
    context,
    protocol
  };
}

/**
 * Create a specialized MCP for Roblox Studio services
 * @param serviceName Name of the service
 * @param initialProperties Initial properties
 * @returns MCP components for the service
 */
export function createRoblexStudioServiceMcp(
  serviceName: string,
  initialProperties: ModelState = {}
): {
  model: RoblexStudioServiceModel;
  context: RoblexContext;
  protocol: RoblexProtocol;
} {
  logger.debug(`Creating Roblox Studio service MCP: ${serviceName}`);
  
  const model = new RoblexStudioServiceModel(`Service_${serviceName}`, {
    serviceName,
    ...initialProperties
  });
  
  const context = new RoblexContext(`Service_${serviceName}Context`);
  const protocol = new RoblexProtocol(`Service_${serviceName}Protocol`, context);
  
  context.registerModel(model as any);
  
  return {
    model,
    context,
    protocol
  };
}

/**
 * The global context that manages all top-level models
 */
export const globalContext = new RoblexContext('GlobalContext');

/**
 * The global protocol that manages top-level message handling
 */
export const globalProtocol = new RoblexProtocol('GlobalProtocol', globalContext);

/**
 * Factory for creating Roblox Studio adapters
 */
export const roblexStudioAdapterFactory = createRoblexStudioAdapterFactory(); 