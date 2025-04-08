import { McpServer, ToolCallback } from './McpServer.js';
/**
 * Simplified tool registry interface
 */
export declare class ToolRegistry {
    private _tools;
    /**
     * Register all tools with an MCP server
     * @param server MCP server instance
     */
    register(server: McpServer): void;
    /**
     * Add a tool to the registry
     * @param name Tool name
     * @param callback Tool implementation
     */
    add(name: string, callback: ToolCallback): void;
}
/**
 * Simplified resource registry interface
 */
export declare class ResourceRegistry {
    private _resources;
    /**
     * Register all resources with an MCP server
     * @param server MCP server instance
     */
    register(server: McpServer): void;
    /**
     * Add a resource to the registry
     * @param name Resource name
     * @param implementation Resource implementation
     */
    add(name: string, implementation: any): void;
}
/**
 * Simplified prompt registry interface
 */
export declare class PromptRegistry {
    private _prompts;
    /**
     * Register all prompts with an MCP server
     * @param server MCP server instance
     */
    register(server: McpServer): void;
    /**
     * Add a prompt to the registry
     * @param name Prompt name
     * @param implementation Prompt implementation
     */
    add(name: string, implementation: any): void;
}
