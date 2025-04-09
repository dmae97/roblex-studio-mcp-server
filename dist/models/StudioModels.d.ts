/**
 * Class for managing Roblox Studio models
 * Provides methods for the Sequential MCP server to access and manipulate models
 */
export declare class RoblexStudioModels {
    private _scripts;
    private _uiElements;
    private _services;
    constructor();
    /**
     * Get a Luau script by ID
     * @param scriptId Script ID to retrieve
     * @returns Script content and metadata
     */
    getLuauScript(scriptId: string): any;
    /**
     * Update a Luau script
     * @param scriptId Script ID to update
     * @param content New script content
     * @returns Updated script metadata
     */
    updateLuauScript(scriptId: string, content: string): any;
    /**
     * Get script metadata
     * @param scriptId Script ID
     * @returns Script metadata
     */
    getScriptMetadata(scriptId: string): any;
    /**
     * Get studio environment information
     * @returns Studio environment data
     */
    getStudioEnvironment(): any;
    /**
     * Run Luau code in a context
     * @param code Luau code to run
     * @param context Context information
     * @param timeout Optional timeout in milliseconds
     * @returns Result of code execution
     */
    runLuauCode(code: string, context?: any, timeout?: number): any;
    /**
     * Get a Luau context
     * @param contextId Context ID
     * @returns Context information
     */
    getLuauContext(contextId: string): any;
    /**
     * List scripts in a path
     * @param path Path to list scripts from
     * @param recursive Whether to list scripts recursively
     * @returns List of script metadata
     */
    listScripts(path?: string, recursive?: boolean): any;
    /**
     * Create a new Luau script
     * @param parentId Parent ID
     * @param name Script name
     * @param scriptType Script type
     * @param content Initial content
     * @returns New script metadata
     */
    createLuauScript(parentId: string, name: string, scriptType: string, content?: string): any;
    /**
     * Get Roblox API information
     * @param className Optional class name
     * @param memberName Optional member name
     * @returns API information
     */
    getRobloxApi(className?: string, memberName?: string): any;
    /**
     * Search the Roblox API
     * @param query Search query
     * @param limit Optional result limit
     * @returns Search results
     */
    searchRobloxApi(query: string, limit?: number): any;
}
