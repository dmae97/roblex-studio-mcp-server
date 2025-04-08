"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roblexStudioAdapterFactory = exports.globalProtocol = exports.globalContext = exports.createRoblexStudioServiceMcp = exports.createRoblexStudioUIMcp = exports.createRoblexStudioScriptMcp = exports.createUiComponentMcp = exports.createGameObjectMcp = exports.createMcp = void 0;
__exportStar(require("./RoblexModel.js"), exports);
__exportStar(require("./RoblexContext.js"), exports);
__exportStar(require("./RoblexProtocol.js"), exports);
__exportStar(require("./RoblexGameModel.js"), exports);
__exportStar(require("./RoblexStudioModels.js"), exports);
__exportStar(require("./RoblexStudioAdapter.js"), exports);
__exportStar(require("./types.js"), exports);
const logger_js_1 = require("../utils/logger.js");
const RoblexContext_js_1 = require("./RoblexContext.js");
const RoblexModel_js_1 = require("./RoblexModel.js");
const RoblexProtocol_js_1 = require("./RoblexProtocol.js");
const RoblexGameModel_js_1 = require("./RoblexGameModel.js");
const RoblexStudioModels_js_1 = require("./RoblexStudioModels.js");
const RoblexStudioAdapter_js_1 = require("./RoblexStudioAdapter.js");
/**
 * Create a complete MCP (Model-Context-Protocol) setup
 * @param name Base name for the MCP components
 * @param initialState Optional initial state for the model
 * @returns Object containing the created model, context, and protocol
 */
function createMcp(name, initialState = {}) {
    logger_js_1.logger.debug(`Creating MCP with name: ${name}`);
    const model = new RoblexModel_js_1.RoblexModel(name, initialState);
    const context = new RoblexContext_js_1.RoblexContext(`${name}Context`);
    const protocol = new RoblexProtocol_js_1.RoblexProtocol(`${name}Protocol`, context);
    context.registerModel(model);
    return {
        model,
        context,
        protocol
    };
}
exports.createMcp = createMcp;
/**
 * Create a specialized MCP for game objects
 * @param objectName Name of the game object
 * @param objectType Type of game object (e.g., 'player', 'npc', 'item')
 * @param initialProperties Initial properties for the object
 * @returns MCP components for the game object
 */
function createGameObjectMcp(objectName, objectType, initialProperties = {}) {
    const initialState = {
        type: objectType,
        id: `${objectType}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        created: new Date().toISOString(),
        ...initialProperties
    };
    logger_js_1.logger.debug(`Creating game object MCP: ${objectName} (${objectType})`);
    const model = new RoblexGameModel_js_1.RoblexGameModel(`${objectType}_${objectName}`, initialState);
    const context = new RoblexContext_js_1.RoblexContext(`${objectType}_${objectName}Context`);
    const protocol = new RoblexProtocol_js_1.RoblexProtocol(`${objectType}_${objectName}Protocol`, context);
    context.registerModel(model);
    return {
        model,
        context,
        protocol
    };
}
exports.createGameObjectMcp = createGameObjectMcp;
/**
 * Create specialized MCP for UI components
 * @param componentName Name of the UI component
 * @param componentType Type of UI component (e.g., 'button', 'panel', 'menu')
 * @param initialProperties Initial properties for the component
 * @returns MCP components for the UI component
 */
function createUiComponentMcp(componentName, componentType, initialProperties = {}) {
    const initialState = {
        type: componentType,
        id: `ui_${componentType}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        visible: true,
        enabled: true,
        ...initialProperties
    };
    return createMcp(`ui_${componentType}_${componentName}`, initialState);
}
exports.createUiComponentMcp = createUiComponentMcp;
/**
 * Create a specialized MCP for Roblox Studio scripts
 * @param scriptName Name of the script
 * @param scriptType Type of script (Script, LocalScript, or ModuleScript)
 * @param source Initial source code
 * @param parent Parent container
 * @returns MCP components for the script
 */
function createRoblexStudioScriptMcp(scriptName, scriptType = 'Script', source = '', parent = 'ServerScriptService') {
    logger_js_1.logger.debug(`Creating Roblox Studio script MCP: ${scriptName} (${scriptType})`);
    const model = new RoblexStudioModels_js_1.RoblexStudioScriptModel(`Script_${scriptName}`, {
        scriptType,
        source,
        parent,
        runContext: scriptType === 'LocalScript' ? 'Client' : 'Server'
    });
    const context = new RoblexContext_js_1.RoblexContext(`Script_${scriptName}Context`);
    const protocol = new RoblexProtocol_js_1.RoblexProtocol(`Script_${scriptName}Protocol`, context);
    context.registerModel(model);
    return {
        model,
        context,
        protocol
    };
}
exports.createRoblexStudioScriptMcp = createRoblexStudioScriptMcp;
/**
 * Create a specialized MCP for Roblox Studio UI elements
 * @param uiName Name of the UI element
 * @param className Class name of the UI element
 * @param initialProperties Initial properties
 * @returns MCP components for the UI element
 */
function createRoblexStudioUIMcp(uiName, className = 'Frame', initialProperties = {}) {
    logger_js_1.logger.debug(`Creating Roblox Studio UI MCP: ${uiName} (${className})`);
    const model = new RoblexStudioModels_js_1.RoblexStudioUIModel(`UI_${uiName}`, {
        className,
        ...initialProperties
    });
    const context = new RoblexContext_js_1.RoblexContext(`UI_${uiName}Context`);
    const protocol = new RoblexProtocol_js_1.RoblexProtocol(`UI_${uiName}Protocol`, context);
    context.registerModel(model);
    return {
        model,
        context,
        protocol
    };
}
exports.createRoblexStudioUIMcp = createRoblexStudioUIMcp;
/**
 * Create a specialized MCP for Roblox Studio services
 * @param serviceName Name of the service
 * @param initialProperties Initial properties
 * @returns MCP components for the service
 */
function createRoblexStudioServiceMcp(serviceName, initialProperties = {}) {
    logger_js_1.logger.debug(`Creating Roblox Studio service MCP: ${serviceName}`);
    const model = new RoblexStudioModels_js_1.RoblexStudioServiceModel(`Service_${serviceName}`, {
        serviceName,
        ...initialProperties
    });
    const context = new RoblexContext_js_1.RoblexContext(`Service_${serviceName}Context`);
    const protocol = new RoblexProtocol_js_1.RoblexProtocol(`Service_${serviceName}Protocol`, context);
    context.registerModel(model);
    return {
        model,
        context,
        protocol
    };
}
exports.createRoblexStudioServiceMcp = createRoblexStudioServiceMcp;
/**
 * The global context that manages all top-level models
 */
exports.globalContext = new RoblexContext_js_1.RoblexContext('GlobalContext');
/**
 * The global protocol that manages top-level message handling
 */
exports.globalProtocol = new RoblexProtocol_js_1.RoblexProtocol('GlobalProtocol', exports.globalContext);
/**
 * Factory for creating Roblox Studio adapters
 */
exports.roblexStudioAdapterFactory = (0, RoblexStudioAdapter_js_1.createRoblexStudioAdapterFactory)();
//# sourceMappingURL=index.js.map