import { McpServer, McpServerOptions } from './McpServer.js';
import { SequentialMcpServer } from './SequentialMcpServer.js';
/**
 * Factory for creating MCP servers
 */
export declare class McpServerFactory {
    /**
     * Create a standard MCP server
     * @param options Server configuration options
     * @returns Standard MCP server instance
     */
    static createStandard(options: McpServerOptions): McpServer;
    /**
     * Create a sequential MCP server
     * @param options Server configuration options
     * @param concurrency Number of concurrent tasks to process (default: 1)
     * @returns Sequential MCP server instance
     */
    static createSequential(options: McpServerOptions, concurrency?: number): SequentialMcpServer;
    /**
     * Create an MCP server of the specified type
     * @param type Type of server to create ('standard' or 'sequential')
     * @param options Server configuration options
     * @param concurrency Number of concurrent tasks for sequential server (default: 1)
     * @returns MCP server instance of the specified type
     */
    static create(type: 'standard' | 'sequential', options: McpServerOptions, concurrency?: number): McpServer;
}
