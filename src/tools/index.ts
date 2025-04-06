import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { codeGenerator } from './codeGenerator.js';
import { assetFinder } from './assetFinder.js';
import { scriptValidator } from './scriptValidator.js';
import { roblexApiConnector } from './roblexApiConnector.js';
import { logger } from '../utils/logger.js';

/**
 * Registry for all Roblex Studio tools
 */
export const roblexTools = {
  register: (server: McpServer) => {
    logger.info('Registering Roblex Studio tools...');
    
    // Register all tools
    codeGenerator.register(server);
    assetFinder.register(server);
    scriptValidator.register(server);
    roblexApiConnector.register(server);
    
    logger.info('Roblex Studio tools registered successfully');
  }
};
