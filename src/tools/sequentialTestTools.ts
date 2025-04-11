import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.js';

/**
 * Test tools for Sequential MCP
 */
export const sequentialTestTools = {
  register(server: McpServer): void {
    // Simple test tools for Sequential MCP
    for (let i = 1; i <= 5; i++) {
      const toolName = `TestTool${i}`;
      
      server.tool(toolName, async (args) => {
        logger.info(`Executing ${toolName} with args: ${JSON.stringify(args)}`);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          success: true,
          toolName,
          receivedArgs: args,
          processingOrder: i,
          timestamp: new Date().toISOString()
        };
      });
    }
    
    // Priority test tools with different priority levels
    for (let i = 1; i <= 3; i++) {
      const toolName = `PriorityTool${i}`;
      const priority = i * 3; // Tools have priorities 3, 6, 9
      
      // For priority tools, using experimental 3rd parameter for priority
      // This would work with our extended Sequential MCP Server
      (server as any).tool(toolName, async (args: any) => {
        logger.info(`Executing ${toolName} (priority: ${priority}) with args: ${JSON.stringify(args)}`);
        
        // Simulate longer processing time for higher priority tasks to demonstrate ordering
        const processingTime = 1000 + (i * 500);
        await new Promise(resolve => setTimeout(resolve, processingTime));
        
        return {
          success: true,
          toolName,
          priority,
          receivedArgs: args,
          processingTime,
          timestamp: new Date().toISOString()
        };
      }, priority);
    }
    
    // Add an "error" test tool
    server.tool('TestToolError', async (args) => {
      logger.info(`Executing TestToolError with args: ${JSON.stringify(args)}`);
      
      // Simulate processing and then throw an error
      await new Promise(resolve => setTimeout(resolve, 500));
      
      throw new Error('This is a test error from TestToolError');
    });
    
    // Add a long-running tool to test cancellation
    server.tool('LongRunningTool', async (args: any) => {
      // 타입스크립트 오류 수정: undefined 체크 추가
      const duration = args && args.duration ? args.duration : 10000; // Default to 10 seconds
      logger.info(`Executing LongRunningTool for ${duration}ms`);
      
      // Report progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        logger.info(`LongRunningTool progress: ${progress}%`);
      }, duration / 10);
      
      try {
        // Simulate long-running task
        await new Promise((resolve, reject) => {
          // Store timeout handle to clear it
          const timeout = setTimeout(resolve, duration);
          
          // Allow for external cancellation (in a real tool)
          // 타입스크립트 오류 수정: undefined 체크 추가
          if (args && args.shouldFail) {
            clearTimeout(timeout);
            reject(new Error('Task was cancelled'));
          }
        });
        
        return {
          success: true,
          toolName: 'LongRunningTool',
          duration,
          completed: true,
          timestamp: new Date().toISOString()
        };
      } finally {
        clearInterval(interval);
      }
    });
    
    logger.info('Sequential MCP test tools registered');
  }
}; 