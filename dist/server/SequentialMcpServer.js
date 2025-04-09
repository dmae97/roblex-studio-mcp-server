"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequentialMcpServer = void 0;
const McpServer_js_1 = require("./McpServer.js");
const logger_js_1 = require("../utils/logger.js");
/**
 * Sequential MCP Server implementation
 * Processes tool calls in sequence, ensuring one call completes before the next begins
 */
class SequentialMcpServer extends McpServer_js_1.McpServer {
    _taskQueue = [];
    _isProcessing = false;
    _concurrency = 1; // Default to single task processing
    _activeCount = 0;
    /**
     * Create a new Sequential MCP server
     * @param options Server configuration options
     * @param concurrency Number of concurrent tasks to process (default: 1)
     */
    constructor(options, concurrency = 1) {
        super(options);
        this._concurrency = Math.max(1, concurrency); // Ensure minimum of 1
        logger_js_1.logger.info(`SequentialMcpServer created with concurrency: ${this._concurrency}`);
    }
    /**
     * Override the tool method to use sequential processing
     * @param name Tool name
     * @param callback Tool implementation
     */
    tool(name, callback) {
        // Wrap the callback in a queue-based processor
        const sequentialCallback = async (args, transport) => {
            return new Promise((resolve, reject) => {
                // Add to task queue
                this._taskQueue.push({
                    transport,
                    toolName: name,
                    args,
                    resolve,
                    reject
                });
                // Start processing if not already doing so
                this._processQueue();
            });
        };
        // Register the tool with the parent class but with our own processing logic
        super.tool(name, async (args) => {
            // This function will be called by the parent class
            // We need the transport from the context
            const transport = this._getCurrentTransport();
            if (!transport) {
                throw new Error('No active transport for tool call');
            }
            return sequentialCallback(args, transport);
        });
    }
    /**
     * Process the task queue
     */
    async _processQueue() {
        // If already processing at max concurrency, just return
        if (this._activeCount >= this._concurrency) {
            return;
        }
        // If queue is empty, nothing to do
        if (this._taskQueue.length === 0) {
            return;
        }
        // Process next task
        const task = this._taskQueue.shift();
        if (!task) {
            return;
        }
        this._activeCount++;
        try {
            // Set current transport for context
            this._setCurrentTransport(task.transport);
            // Get the original tool callback
            const toolCallback = this._getOriginalTool(task.toolName);
            if (!toolCallback) {
                throw new Error(`Tool not found: ${task.toolName}`);
            }
            // Execute the tool
            logger_js_1.logger.debug(`Executing sequential tool: ${task.toolName}`);
            const result = await toolCallback(task.args);
            // Resolve the promise
            task.resolve(result);
            // Send result to client
            await task.transport.send({
                type: 'tool_result',
                data: {
                    toolName: task.toolName,
                    success: true,
                    result
                }
            });
        }
        catch (error) {
            logger_js_1.logger.error(`Error executing sequential tool ${task.toolName}: ${error instanceof Error ? error.message : String(error)}`);
            // Reject the promise
            task.reject(error);
            // Send error to client
            await task.transport.send({
                type: 'tool_result',
                data: {
                    toolName: task.toolName,
                    success: false,
                    error: error instanceof Error ? error.message : String(error)
                }
            });
        }
        finally {
            this._activeCount--;
            this._clearCurrentTransport();
            // Continue processing queue
            this._processQueue();
        }
    }
    // Track current transport in execution context
    _currentTransport = null;
    _setCurrentTransport(transport) {
        this._currentTransport = transport;
    }
    _getCurrentTransport() {
        return this._currentTransport;
    }
    _clearCurrentTransport() {
        this._currentTransport = null;
    }
    // Access original tool callbacks (from parent class)
    _getOriginalTool(name) {
        // This is a bit of a hack since we're accessing a protected member
        // A better implementation would have McpServer expose a way to get tools
        return this._tools.get(name);
    }
}
exports.SequentialMcpServer = SequentialMcpServer;
//# sourceMappingURL=SequentialMcpServer.js.map