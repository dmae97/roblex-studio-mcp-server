import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { scriptGenerator } from './scriptGenerator.js';
import { bugFinder } from './bugFinder.js';
import { logger } from '../utils/logger.js';

/**
 * Registry for all Roblex Studio prompts
 */
export const roblexPrompts = {
  register: (server: McpServer) => {
    logger.info('Registering Roblex Studio prompts...');
    
    // Register all prompts
    scriptGenerator.register(server);
    bugFinder.register(server);
    
    logger.info('Roblex Studio prompts registered successfully');
  }
};
