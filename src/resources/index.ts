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

    try {
      // 문서 리소스 등록
      if (documentation && typeof documentation.register === 'function') {
        documentation.register(server);
      }

      // 템플릿 리소스 등록
      if (templates && typeof templates.register === 'function') {
        templates.register(server);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error registering resources: ${errorMessage}`);
    }

    logger.info('Roblex Studio resources registered successfully');
  }
};
