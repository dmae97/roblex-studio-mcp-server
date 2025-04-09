import { SequentialMcpServer } from './SequentialMcpServer.js';
import { McpServerOptions } from './McpServer.js';
import { RoblexStudioModels } from '../models/StudioModels.js';
/**
 * Roblox Studio specific Sequential MCP server
 * Handles Roblox Studio specific tools and events
 */
export declare class RoblexStudioSequentialMcp extends SequentialMcpServer {
    private _models;
    /**
     * Create a new Roblox Studio Sequential MCP server
     * @param options Server configuration options
     * @param concurrency Number of concurrent tasks (default: 1)
     */
    constructor(options: McpServerOptions, concurrency?: number);
    /**
     * Register Roblox Studio specific tools
     */
    private _registerStudioTools;
    /**
     * Get the Roblox Studio models
     */
    get models(): RoblexStudioModels;
}
