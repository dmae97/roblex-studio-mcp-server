import { McpServer, McpServerOptions, Transport, ToolCallback } from './McpServer.js';
import { logger } from '../utils/logger.js';

/**
 * Interface for a task in the sequential queue
 */
interface SequentialTask {
  transport: Transport;
  toolName: string;
  args: any;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  priority?: number; // Added priority field for prioritized tasks
  createdAt: number; // Timestamp when task was created
}

/**
 * Queue statistics interface
 */
interface QueueStats {
  queueLength: number;
  activeCount: number;
  totalProcessed: number;
  averageProcessingTime: number;
  maxConcurrency: number;
}

/**
 * Sequential MCP Server implementation
 * Processes tool calls in sequence, ensuring one call completes before the next begins
 */
export class SequentialMcpServer extends McpServer {
  private _taskQueue: SequentialTask[] = [];
  private _isProcessing: boolean = false;
  private _concurrency: number = 1; // Default to single task processing
  private _activeCount: number = 0;
  
  // Added statistics tracking
  private _totalProcessed: number = 0;
  private _processingTimes: number[] = [];
  private _maxProcessingTime: number = 0;
  private _priorityThreshold: number = 5; // Tasks with priority higher than this are considered high priority

  /**
   * Create a new Sequential MCP server
   * @param options Server configuration options
   * @param concurrency Number of concurrent tasks to process (default: 1)
   */
  constructor(options: McpServerOptions, concurrency: number = 1) {
    super(options);
    this._concurrency = Math.max(1, concurrency); // Ensure minimum of 1
    logger.info(`SequentialMcpServer created with concurrency: ${this._concurrency}`);
  }

  /**
   * Override the tool method to use sequential processing
   * @param name Tool name
   * @param callback Tool implementation
   * @param priority Optional priority level (higher values processed first)
   */
  tool(name: string, callback: ToolCallback, priority?: number): void {
    // Wrap the callback in a queue-based processor
    const sequentialCallback = async (args: any, transport: Transport): Promise<any> => {
      return new Promise((resolve, reject) => {
        // Add to task queue
        this._taskQueue.push({
          transport,
          toolName: name,
          args,
          resolve,
          reject,
          priority,
          createdAt: Date.now()
        });
        
        // Sort the queue by priority (higher first)
        if (priority !== undefined) {
          this._sortQueueByPriority();
        }
        
        // Start processing if not already doing so
        this._processQueue();
      });
    };

    // Register the tool with the parent class but with our own processing logic
    super.tool(name, async (args: any) => {
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
  private async _processQueue(): Promise<void> {
    // If already processing at max concurrency, just return
    if (this._activeCount >= this._concurrency) {
      logger.debug(`Sequential queue: already processing at max concurrency: ${this._activeCount}/${this._concurrency}`);
      return;
    }

    // If queue is empty, nothing to do
    if (this._taskQueue.length === 0) {
      logger.debug(`Sequential queue: empty, nothing to process`);
      return;
    }

    // Process next task
    const task = this._taskQueue.shift();
    if (!task) {
      logger.debug(`Sequential queue: no task after shift, skipping`);
      return;
    }

    const isPriority = task.priority !== undefined && task.priority > this._priorityThreshold;
    logger.info(`Sequential queue: processing ${isPriority ? 'PRIORITY ' : ''}task ${task.toolName} (${this._activeCount + 1}/${this._concurrency}), remaining: ${this._taskQueue.length}`);
    
    this._activeCount++;
    const startTime = Date.now();
    
    try {
      // Set current transport for context
      this._setCurrentTransport(task.transport);
      
      // Get the original tool callback
      const toolCallback = this._getOriginalTool(task.toolName);
      if (!toolCallback) {
        throw new Error(`Tool not found: ${task.toolName}`);
      }

      // Execute the tool
      logger.debug(`Executing sequential tool: ${task.toolName}`);
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
      
      // Update statistics
      this._updateStatistics(Date.now() - startTime);
      
    } catch (error) {
      logger.error(`Error executing sequential tool ${task.toolName}: ${error instanceof Error ? error.message : String(error)}`);
      
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
      
      // Still update statistics
      this._updateStatistics(Date.now() - startTime);
      
    } finally {
      this._activeCount--;
      this._clearCurrentTransport();
      
      // Continue processing queue
      this._processQueue();
    }
  }
  
  /**
   * Sort the queue by priority, then by creation time
   */
  private _sortQueueByPriority(): void {
    this._taskQueue.sort((a, b) => {
      // Sort by priority first (higher values first)
      const priorityA = a.priority || 0;
      const priorityB = b.priority || 0;
      
      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }
      
      // Then by creation time (oldest first)
      return a.createdAt - b.createdAt;
    });
  }
  
  /**
   * Update queue statistics with new processing time
   */
  private _updateStatistics(processingTime: number): void {
    this._totalProcessed++;
    this._processingTimes.push(processingTime);
    
    // Keep only the last 100 processing times for average calculation
    if (this._processingTimes.length > 100) {
      this._processingTimes.shift();
    }
    
    // Update max processing time
    if (processingTime > this._maxProcessingTime) {
      this._maxProcessingTime = processingTime;
    }
  }
  
  /**
   * Get current queue statistics
   */
  getQueueStats(): QueueStats {
    // Calculate average processing time
    const avgTime = this._processingTimes.length > 0 
      ? this._processingTimes.reduce((sum, time) => sum + time, 0) / this._processingTimes.length
      : 0;
      
    return {
      queueLength: this._taskQueue.length,
      activeCount: this._activeCount,
      totalProcessed: this._totalProcessed,
      averageProcessingTime: avgTime,
      maxConcurrency: this._concurrency
    };
  }
  
  /**
   * Clear the task queue
   * @returns Number of tasks cleared
   */
  clearQueue(): number {
    const count = this._taskQueue.length;
    
    // Reject all pending tasks
    this._taskQueue.forEach(task => {
      task.reject(new Error('Task queue cleared'));
    });
    
    this._taskQueue = [];
    logger.info(`Task queue cleared: ${count} tasks removed`);
    
    return count;
  }
  
  /**
   * Update the concurrency level
   * @param concurrency New concurrency level
   */
  setConcurrency(concurrency: number): void {
    this._concurrency = Math.max(1, concurrency);
    logger.info(`Concurrency updated to ${this._concurrency}`);
    
    // Try to process queue with new concurrency
    this._processQueue();
  }

  // Track current transport in execution context
  private _currentTransport: Transport | null = null;
  
  private _setCurrentTransport(transport: Transport): void {
    this._currentTransport = transport;
  }
  
  private _getCurrentTransport(): Transport | null {
    return this._currentTransport;
  }
  
  private _clearCurrentTransport(): void {
    this._currentTransport = null;
  }
  
  // Access original tool callbacks (from parent class)
  private _getOriginalTool(name: string): ToolCallback | undefined {
    // This is a bit of a hack since we're accessing a protected member
    // A better implementation would have McpServer expose a way to get tools
    return (this as any)._tools.get(name);
  }
} 