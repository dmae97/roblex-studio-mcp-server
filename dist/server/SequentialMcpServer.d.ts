import { McpServer, McpServerOptions, ToolCallback } from './McpServer.js';
/**
 * Sequential MCP Server implementation
 * Processes tool calls in sequence, ensuring one call completes before the next begins
 */
export declare class SequentialMcpServer extends McpServer {
    private _taskQueue;
    private _isProcessing;
    private _concurrency;
    private _activeCount;
    /**
     * Create a new Sequential MCP server
     * @param options Server configuration options
     * @param concurrency Number of concurrent tasks to process (default: 1)
     */
    constructor(options: McpServerOptions, concurrency?: number);
    /**
     * Override the tool method to use sequential processing
     * @param name Tool name
     * @param callback Tool implementation
     */
    tool(name: string, callback: ToolCallback): void;
    /**
     * Process the task queue
     */
    private _processQueue;
    private _currentTransport;
    private _setCurrentTransport;
    private _getCurrentTransport;
    private _clearCurrentTransport;
    private _getOriginalTool;
}
