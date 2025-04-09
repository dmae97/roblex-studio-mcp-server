"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoblexStudioSequentialMcp = void 0;
const SequentialMcpServer_js_1 = require("./SequentialMcpServer.js");
const logger_js_1 = require("../utils/logger.js");
const StudioModels_js_1 = require("../models/StudioModels.js");
/**
 * Roblox Studio specific Sequential MCP server
 * Handles Roblox Studio specific tools and events
 */
class RoblexStudioSequentialMcp extends SequentialMcpServer_js_1.SequentialMcpServer {
    _models;
    /**
     * Create a new Roblox Studio Sequential MCP server
     * @param options Server configuration options
     * @param concurrency Number of concurrent tasks (default: 1)
     */
    constructor(options, concurrency = 1) {
        super(options, concurrency);
        // Initialize Roblox Studio specific models
        this._models = new StudioModels_js_1.RoblexStudioModels();
        // Register Roblox Studio specific tools
        this._registerStudioTools();
        logger_js_1.logger.info('Roblox Studio Sequential MCP server initialized');
    }
    /**
     * Register Roblox Studio specific tools
     */
    _registerStudioTools() {
        // Register GetLuauScript tool
        this.tool('GetLuauScript', async (args) => {
            const scriptId = args.scriptId;
            if (!scriptId) {
                throw new Error('Missing scriptId parameter');
            }
            logger_js_1.logger.debug(`GetLuauScript called for script: ${scriptId}`);
            return this._models.getLuauScript(scriptId);
        });
        // Register UpdateLuauScript tool
        this.tool('UpdateLuauScript', async (args) => {
            const { scriptId, content } = args;
            if (!scriptId) {
                throw new Error('Missing scriptId parameter');
            }
            if (content === undefined) {
                throw new Error('Missing content parameter');
            }
            logger_js_1.logger.debug(`UpdateLuauScript called for script: ${scriptId}`);
            return this._models.updateLuauScript(scriptId, content);
        });
        // Register GetScriptMetadata tool
        this.tool('GetScriptMetadata', async (args) => {
            const scriptId = args.scriptId;
            if (!scriptId) {
                throw new Error('Missing scriptId parameter');
            }
            logger_js_1.logger.debug(`GetScriptMetadata called for script: ${scriptId}`);
            return this._models.getScriptMetadata(scriptId);
        });
        // Register GetStudioEnvironment tool
        this.tool('GetStudioEnvironment', async () => {
            logger_js_1.logger.debug('GetStudioEnvironment called');
            return this._models.getStudioEnvironment();
        });
        // Register RunLuauCode tool
        this.tool('RunLuauCode', async (args) => {
            const { code, context, timeout } = args;
            if (!code) {
                throw new Error('Missing code parameter');
            }
            logger_js_1.logger.debug('RunLuauCode called');
            return this._models.runLuauCode(code, context, timeout);
        });
        // Register GetLuauContext tool
        this.tool('GetLuauContext', async (args) => {
            const contextId = args.contextId;
            if (!contextId) {
                throw new Error('Missing contextId parameter');
            }
            logger_js_1.logger.debug(`GetLuauContext called for context: ${contextId}`);
            return this._models.getLuauContext(contextId);
        });
        // Register ListScripts tool
        this.tool('ListScripts', async (args) => {
            const { path, recursive } = args;
            logger_js_1.logger.debug(`ListScripts called for path: ${path || 'root'}`);
            return this._models.listScripts(path, recursive);
        });
        // Register CreateLuauScript tool
        this.tool('CreateLuauScript', async (args) => {
            const { parentId, name, scriptType, content } = args;
            if (!parentId) {
                throw new Error('Missing parentId parameter');
            }
            if (!name) {
                throw new Error('Missing name parameter');
            }
            if (!scriptType) {
                throw new Error('Missing scriptType parameter');
            }
            logger_js_1.logger.debug(`CreateLuauScript called: ${name} under ${parentId}`);
            return this._models.createLuauScript(parentId, name, scriptType, content || '');
        });
        // Register GetRobloxApi tool
        this.tool('GetRobloxApi', async (args) => {
            const { className, memberName } = args;
            logger_js_1.logger.debug(`GetRobloxApi called: ${className || 'all'} ${memberName || ''}`);
            return this._models.getRobloxApi(className, memberName);
        });
        // Register SearchRobloxApi tool
        this.tool('SearchRobloxApi', async (args) => {
            const { query, limit } = args;
            if (!query) {
                throw new Error('Missing query parameter');
            }
            logger_js_1.logger.debug(`SearchRobloxApi called: ${query}`);
            return this._models.searchRobloxApi(query, limit);
        });
        logger_js_1.logger.info('Registered Roblox Studio tools');
    }
    /**
     * Get the Roblox Studio models
     */
    get models() {
        return this._models;
    }
}
exports.RoblexStudioSequentialMcp = RoblexStudioSequentialMcp;
//# sourceMappingURL=RoblexStudioSequentialMcp.js.map