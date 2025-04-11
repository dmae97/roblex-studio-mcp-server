import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { documentation } from './documentation.js';
import { templates } from './templates.js';
import { logger } from '../utils/logger.js';

/**
 * Registry for all Roblex Studio resources
 */
import { McpServer } from '../server/McpServer';
import { logger } from '../utils/logger';

// 리소스 정의 인터페이스
interface ResourceDefinition {
  name: string;
  description: string;
  handler: (params: any, context?: any) => Promise<any>;
}

// 예시 리소스: 도움말
const helpResource: ResourceDefinition = {
  name: 'help',
  description: '서버 및 도구 사용 방법에 대한 정보 제공',
  handler: async (_params: any, _context: any) => {
    logger.debug('도움말 리소스 요청됨');
    return {
      server: {
        name: 'Roblex Studio MCP Server',
        description: 'Roblex Studio 환경을 위한 AI 도우미 서버'
      },
      tools: {
        'get-current-time': '현재 시간 조회',
        // 다른 도구들의 설명 추가 가능
      },
      resources: {
        'help': '서버 및 도구 사용 방법에 대한 정보'
      }
    };
  }
};

// 모든 리소스 목록
const allResources: ResourceDefinition[] = [
  helpResource,
  // 더 많은 리소스 추가 가능
];

// 리소스 등록 및 관리를 위한 객체
export const roblexResources = {
<<<<<<< Updated upstream
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
=======
  /**
   * 서버에 리소스 등록
   * @param server MCP 서버 인스턴스
   */
  register: (server: McpServer): void => {
    logger.info(`${allResources.length}개의 리소스 등록 중...`);
    allResources.forEach(resource => {
      logger.debug(`리소스 등록: ${resource.name}`);
      server.resource(resource.name, resource.description, resource.handler);
    });
    logger.info('모든 리소스 등록 완료');
  },

  /**
   * 등록된 리소스 목록 가져오기
   * @returns 리소스 정의 목록
   */
  getResourceList: (): Array<{ name: string; description: string }> => {
    return allResources.map(resource => ({
      name: resource.name,
      description: resource.description
    }));
  },

  /**
   * 등록된 리소스 수 가져오기
   * @returns 리소스 수
   */
  getResourceCount: (): number => {
    return allResources.length;
  },

  /**
   * 리소스 이름으로 리소스 찾기
   * @param name 리소스 이름
   * @returns 리소스 정의 또는 undefined
   */
  getResourceByName: (name: string): ResourceDefinition | undefined => {
    return allResources.find(resource => resource.name === name);
  }
}; 
>>>>>>> Stashed changes
