import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { scriptGenerator } from './scriptGenerator.js';
import { bugFinder } from './bugFinder.js';
import { logger } from '../utils/logger.js';

/**
 * Registry for all Roblex Studio prompts
 */
import { McpServer } from '../server/McpServer';
import { logger } from '../utils/logger';

// 프롬프트 정의 인터페이스
interface PromptDefinition {
  name: string;
  description: string;
  handler: (params: any, context?: any) => Promise<string>;
}

// 예시 프롬프트: 도구 사용 방법
const toolUsagePrompt: PromptDefinition = {
  name: 'tool-usage',
  description: '도구 사용 방법에 대한 프롬프트 제공',
  handler: async (params: any, _context: any) => {
    logger.debug('도구 사용 방법 프롬프트 요청됨');
    const toolName = params.toolName || 'unknown';
    
    return `이 도구(${toolName})를 사용하려면 다음 단계를 따르세요:
1. 도구의 목적과 기능을 이해합니다.
2. 필요한 매개변수를 준비합니다.
3. 도구를 호출하고 결과를 확인합니다.
4. 필요한 경우 매개변수를 조정하여 다시 시도합니다.`;
  }
};

// 모든 프롬프트 목록
const allPrompts: PromptDefinition[] = [
  toolUsagePrompt,
  // 더 많은 프롬프트 추가 가능
];

// 프롬프트 등록 및 관리를 위한 객체
export const roblexPrompts = {
<<<<<<< Updated upstream
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
=======
  /**
   * 서버에 프롬프트 등록
   * @param server MCP 서버 인스턴스
   */
  register: (server: McpServer): void => {
    logger.info(`${allPrompts.length}개의 프롬프트 등록 중...`);
    allPrompts.forEach(prompt => {
      logger.debug(`프롬프트 등록: ${prompt.name}`);
      server.prompt(prompt.name, prompt.description, prompt.handler);
    });
    logger.info('모든 프롬프트 등록 완료');
  },

  /**
   * 등록된 프롬프트 목록 가져오기
   * @returns 프롬프트 정의 목록
   */
  getPromptList: (): Array<{ name: string; description: string }> => {
    return allPrompts.map(prompt => ({
      name: prompt.name,
      description: prompt.description
    }));
  },

  /**
   * 등록된 프롬프트 수 가져오기
   * @returns 프롬프트 수
   */
  getPromptCount: (): number => {
    return allPrompts.length;
  },

  /**
   * 프롬프트 이름으로 프롬프트 찾기
   * @param name 프롬프트 이름
   * @returns 프롬프트 정의 또는 undefined
   */
  getPromptByName: (name: string): PromptDefinition | undefined => {
    return allPrompts.find(prompt => prompt.name === name);
  }
};
>>>>>>> Stashed changes
