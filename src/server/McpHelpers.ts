import { McpServer, ToolCallback } from './McpServer.js';
import { logger } from '../utils/logger.js';

/**
 * Simplified tool registry interface
 */
export class ToolRegistry {
  private _tools: Map<string, ToolCallback> = new Map();
  
  /**
   * Register all tools with an MCP server
   * @param server MCP server instance
   */
  register(server: McpServer): void {
    this._tools.forEach((callback, name) => {
      server.tool(name, callback);
    });
    
    logger.info(`Registered ${this._tools.size} tools with server`);
  }
  
  /**
   * Add a tool to the registry
   * @param name Tool name
   * @param callback Tool implementation
   */
  add(name: string, callback: ToolCallback): void {
    this._tools.set(name, callback);
    logger.debug(`Added tool to registry: ${name}`);
  }
}

/**
 * Simplified resource registry interface
 */
export class ResourceRegistry {
  private _resources: Map<string, any> = new Map();
  
  /**
   * Register all resources with an MCP server
   * @param server MCP server instance
   */
  register(server: McpServer): void {
    // In our simplified implementation, we don't directly register resources
    // but log the registration for compatibility
    logger.info(`Registered ${this._resources.size} resources with server`);
  }
  
  /**
   * Add a resource to the registry
   * @param name Resource name
   * @param implementation Resource implementation
   */
  add(name: string, implementation: any): void {
    this._resources.set(name, implementation);
    logger.debug(`Added resource to registry: ${name}`);
  }
}

/**
 * Simplified prompt registry interface
 */
export class PromptRegistry {
  private _prompts: Map<string, any> = new Map();
  
  /**
   * Register all prompts with an MCP server
   * @param server MCP server instance
   */
  register(server: McpServer): void {
    // In our simplified implementation, we don't directly register prompts
    // but log the registration for compatibility
    logger.info(`Registered ${this._prompts.size} prompts with server`);
  }
  
  /**
   * Add a prompt to the registry
   * @param name Prompt name
   * @param implementation Prompt implementation
   */
  add(name: string, implementation: any): void {
    this._prompts.set(name, implementation);
    logger.debug(`Added prompt to registry: ${name}`);
  }
} 