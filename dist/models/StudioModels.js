"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoblexStudioModels = void 0;
const RoblexStudioModels_js_1 = require("./RoblexStudioModels.js");
const logger_js_1 = require("../utils/logger.js");
/**
 * Class for managing Roblox Studio models
 * Provides methods for the Sequential MCP server to access and manipulate models
 */
class RoblexStudioModels {
    _scripts = new Map();
    _uiElements = new Map();
    _services = new Map();
    constructor() {
        logger_js_1.logger.info('RoblexStudioModels initialized');
    }
    /**
     * Get a Luau script by ID
     * @param scriptId Script ID to retrieve
     * @returns Script content and metadata
     */
    getLuauScript(scriptId) {
        const script = this._scripts.get(scriptId);
        if (!script) {
            throw new Error(`Script not found: ${scriptId}`);
        }
        return {
            id: scriptId,
            source: script.getSource(),
            scriptType: script.getScriptType(),
            runContext: script.getRunContext(),
            enabled: script.isEnabled(),
            parent: script.getParent(),
            modified: script.getValue('modified')
        };
    }
    /**
     * Update a Luau script
     * @param scriptId Script ID to update
     * @param content New script content
     * @returns Updated script metadata
     */
    updateLuauScript(scriptId, content) {
        const script = this._scripts.get(scriptId);
        if (!script) {
            throw new Error(`Script not found: ${scriptId}`);
        }
        script.setSource(content);
        return {
            id: scriptId,
            source: script.getSource(),
            modified: script.getValue('modified')
        };
    }
    /**
     * Get script metadata
     * @param scriptId Script ID
     * @returns Script metadata
     */
    getScriptMetadata(scriptId) {
        const script = this._scripts.get(scriptId);
        if (!script) {
            throw new Error(`Script not found: ${scriptId}`);
        }
        return {
            id: scriptId,
            scriptType: script.getScriptType(),
            runContext: script.getRunContext(),
            enabled: script.isEnabled(),
            parent: script.getParent(),
            created: script.getValue('created'),
            modified: script.getValue('modified')
        };
    }
    /**
     * Get studio environment information
     * @returns Studio environment data
     */
    getStudioEnvironment() {
        return {
            version: '1.0.0',
            mode: 'Edit',
            activeScriptId: null,
            scripts: Array.from(this._scripts.keys()),
            uiElements: Array.from(this._uiElements.keys()),
            services: Array.from(this._services.keys())
        };
    }
    /**
     * Run Luau code in a context
     * @param code Luau code to run
     * @param context Context information
     * @param timeout Optional timeout in milliseconds
     * @returns Result of code execution
     */
    runLuauCode(code, context, timeout) {
        logger_js_1.logger.debug('Running Luau code', { codeLength: code.length, context, timeout });
        // In a real implementation, this would execute the code in Roblox Studio
        // For now, just return a mock result
        return {
            success: true,
            output: 'Code executed successfully',
            result: null,
            executionTime: 10
        };
    }
    /**
     * Get a Luau context
     * @param contextId Context ID
     * @returns Context information
     */
    getLuauContext(contextId) {
        // In a real implementation, this would retrieve context info from Roblox Studio
        // For now, just return a mock context
        return {
            id: contextId,
            name: `Context_${contextId}`,
            scope: 'Server',
            variables: []
        };
    }
    /**
     * List scripts in a path
     * @param path Path to list scripts from
     * @param recursive Whether to list scripts recursively
     * @returns List of script metadata
     */
    listScripts(path, recursive) {
        const scripts = Array.from(this._scripts.values());
        // Filter by path if provided
        const filteredScripts = path
            ? scripts.filter(script => script.getParent().startsWith(path))
            : scripts;
        return {
            scripts: filteredScripts.map(script => ({
                id: script.id,
                scriptType: script.getScriptType(),
                parent: script.getParent(),
                enabled: script.isEnabled()
            }))
        };
    }
    /**
     * Create a new Luau script
     * @param parentId Parent ID
     * @param name Script name
     * @param scriptType Script type
     * @param content Initial content
     * @returns New script metadata
     */
    createLuauScript(parentId, name, scriptType, content = '') {
        const scriptId = `${parentId}/${name}`;
        if (this._scripts.has(scriptId)) {
            throw new Error(`Script already exists: ${scriptId}`);
        }
        const script = new RoblexStudioModels_js_1.RoblexStudioScriptModel(scriptId, {
            scriptType,
            source: content,
            parent: parentId
        });
        this._scripts.set(scriptId, script);
        logger_js_1.logger.info(`Created new script: ${scriptId}`);
        return {
            id: scriptId,
            scriptType: script.getScriptType(),
            parent: script.getParent(),
            enabled: script.isEnabled()
        };
    }
    /**
     * Get Roblox API information
     * @param className Optional class name
     * @param memberName Optional member name
     * @returns API information
     */
    getRobloxApi(className, memberName) {
        // In a real implementation, this would retrieve API info from Roblox Studio
        // For now, just return a mock API
        return {
            className: className || 'GlobalAPI',
            members: [
                {
                    name: 'print',
                    type: 'function',
                    description: 'Prints values to the output'
                },
                {
                    name: 'warn',
                    type: 'function',
                    description: 'Prints a warning to the output'
                }
            ]
        };
    }
    /**
     * Search the Roblox API
     * @param query Search query
     * @param limit Optional result limit
     * @returns Search results
     */
    searchRobloxApi(query, limit) {
        // In a real implementation, this would search the API in Roblox Studio
        // For now, just return mock results
        return {
            query,
            results: [
                {
                    className: 'Workspace',
                    memberName: 'CurrentCamera',
                    type: 'property',
                    description: 'The current camera used to render the scene'
                },
                {
                    className: 'Instance',
                    memberName: 'Name',
                    type: 'property',
                    description: 'The name of this Instance'
                }
            ].slice(0, limit || 10)
        };
    }
}
exports.RoblexStudioModels = RoblexStudioModels;
//# sourceMappingURL=StudioModels.js.map