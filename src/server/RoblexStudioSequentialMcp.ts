import { SequentialMcpServer } from './SequentialMcpServer.js';
import { McpServerOptions } from './McpServer.js';
import { logger } from '../utils/logger.js';
import { RoblexStudioModels } from '../models/StudioModels.js';

/**
 * Roblox Studio specific Sequential MCP server
 * Handles Roblox Studio specific tools and events
 */
export class RoblexStudioSequentialMcp extends SequentialMcpServer {
  private _models: RoblexStudioModels;
  
  /**
   * Create a new Roblox Studio Sequential MCP server
   * @param options Server configuration options
   * @param concurrency Number of concurrent tasks (default: 1)
   */
  constructor(options: McpServerOptions, concurrency: number = 1) {
    super(options, concurrency);
    
    // Initialize Roblox Studio specific models
    this._models = new RoblexStudioModels();
    
    // Register Roblox Studio specific tools
    this._registerStudioTools();
    
    logger.info('Roblox Studio Sequential MCP server initialized');
  }
  
  /**
   * Register Roblox Studio specific tools
   */
  private _registerStudioTools(): void {
    // Register GetLuauScript tool
    this.tool('GetLuauScript', async (args: any) => {
      const scriptId = args.scriptId;
      if (!scriptId) {
        throw new Error('Missing scriptId parameter');
      }
      
      logger.debug(`GetLuauScript called for script: ${scriptId}`);
      return this._models.getLuauScript(scriptId);
    });
    
    // Register UpdateLuauScript tool
    this.tool('UpdateLuauScript', async (args: any) => {
      const { scriptId, content } = args;
      if (!scriptId) {
        throw new Error('Missing scriptId parameter');
      }
      if (content === undefined) {
        throw new Error('Missing content parameter');
      }
      
      logger.debug(`UpdateLuauScript called for script: ${scriptId}`);
      return this._models.updateLuauScript(scriptId, content);
    });
    
    // Register GetScriptMetadata tool
    this.tool('GetScriptMetadata', async (args: any) => {
      const scriptId = args.scriptId;
      if (!scriptId) {
        throw new Error('Missing scriptId parameter');
      }
      
      logger.debug(`GetScriptMetadata called for script: ${scriptId}`);
      return this._models.getScriptMetadata(scriptId);
    });
    
    // Register GetStudioEnvironment tool
    this.tool('GetStudioEnvironment', async () => {
      logger.debug('GetStudioEnvironment called');
      return this._models.getStudioEnvironment();
    });
    
    // Register RunLuauCode tool
    this.tool('RunLuauCode', async (args: any) => {
      const { code, context, timeout } = args;
      if (!code) {
        throw new Error('Missing code parameter');
      }
      
      logger.debug('RunLuauCode called');
      return this._models.runLuauCode(code, context, timeout);
    });
    
    // Register GetLuauContext tool
    this.tool('GetLuauContext', async (args: any) => {
      const contextId = args.contextId;
      if (!contextId) {
        throw new Error('Missing contextId parameter');
      }
      
      logger.debug(`GetLuauContext called for context: ${contextId}`);
      return this._models.getLuauContext(contextId);
    });
    
    // Register ListScripts tool
    this.tool('ListScripts', async (args: any) => {
      const { path, recursive } = args;
      
      logger.debug(`ListScripts called for path: ${path || 'root'}`);
      return this._models.listScripts(path, recursive);
    });
    
    // Register CreateLuauScript tool
    this.tool('CreateLuauScript', async (args: any) => {
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
      
      logger.debug(`CreateLuauScript called: ${name} under ${parentId}`);
      return this._models.createLuauScript(parentId, name, scriptType, content || '');
    });
    
    // Register GetRobloxApi tool
    this.tool('GetRobloxApi', async (args: any) => {
      const { className, memberName } = args;
      
      logger.debug(`GetRobloxApi called: ${className || 'all'} ${memberName || ''}`);
      return this._models.getRobloxApi(className, memberName);
    });
    
    // Register SearchRobloxApi tool
    this.tool('SearchRobloxApi', async (args: any) => {
      const { query, limit } = args;
      if (!query) {
        throw new Error('Missing query parameter');
      }
      
      logger.debug(`SearchRobloxApi called: ${query}`);
      return this._models.searchRobloxApi(query, limit);
    });
    
    logger.info('Registered Roblox Studio tools');
  }
  
  /**
   * Get the Roblox Studio models
   */
  get models(): RoblexStudioModels {
    return this._models;
  }
} 