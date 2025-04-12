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

    try {
      // 스크립트 생성기 프롬프트 등록
      if (scriptGenerator && typeof scriptGenerator.register === 'function') {
        scriptGenerator.register(server);
      }

      // 버그 파인더 프롬프트 등록
      if (bugFinder && typeof bugFinder.register === 'function') {
        bugFinder.register(server);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error registering prompts: ${errorMessage}`);
    }

    logger.info('Roblex Studio prompts registered successfully');
  }
};
