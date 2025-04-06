import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { documentation } from './documentation.js';
import { templates } from './templates.js';
import { logger } from '../utils/logger.js';

/**
 * Registry for all Roblex Studio resources
 */
export const roblexResources = {
  register: (server: McpServer) => {
    logger.info('Registering Roblex Studio resources...');
    
    // Register all resources
    documentation.register(server);
    templates.register(server);
    
    logger.info('Roblex Studio resources registered successfully');
  }
};
