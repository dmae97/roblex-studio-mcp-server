import { McpServer, McpServerOptions } from './McpServer.js';
import { SequentialMcpServer } from './SequentialMcpServer.js';
import { logger } from '../utils/logger.js';

/**
 * Factory for creating MCP servers
 */
export class McpServerFactory {
  /**
   * Create a standard MCP server
   * @param options Server configuration options
   * @returns Standard MCP server instance
   */
  static createStandard(options: McpServerOptions): McpServer {
    logger.info(`Creating standard MCP server: ${options.name}`);
    return new McpServer(options);
  }
  
  /**
   * Create a sequential MCP server
   * @param options Server configuration options
   * @param concurrency Number of concurrent tasks to process (default: 1)
   * @returns Sequential MCP server instance
   */
  static createSequential(options: McpServerOptions, concurrency: number = 1): SequentialMcpServer {
    logger.info(`Creating sequential MCP server: ${options.name} with concurrency ${concurrency}`);
    return new SequentialMcpServer(options, concurrency);
  }
  
  /**
   * Create an MCP server of the specified type
   * @param type Type of server to create ('standard' or 'sequential')
   * @param options Server configuration options
   * @param concurrency Number of concurrent tasks for sequential server (default: 1)
   * @returns MCP server instance of the specified type
   */
  static create(
    type: 'standard' | 'sequential',
    options: McpServerOptions,
    concurrency: number = 1
  ): McpServer {
    switch (type) {
      case 'standard':
        return this.createStandard(options);
      case 'sequential':
        return this.createSequential(options, concurrency);
      default:
        logger.warn(`Unknown server type '${type}', defaulting to standard`);
        return this.createStandard(options);
    }
  }
} 