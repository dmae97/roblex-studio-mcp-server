<<<<<<< Updated upstream
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ToolRegistry } from '../server/McpHelpers.js';
import { scriptGenerator } from './scriptGenerator.js'; // Import the new tool
import { assetFinder } from './assetFinder.js';
import { scriptValidator } from './scriptValidator.js';
import { roblexApiConnector } from './roblexApiConnector.js';
import { codeGenerator } from './codeGenerator.js'; // 추가
import datastoreManager from './datastore/datastoreManager.js'; // 기본 가져오기로 수정
import { uiBuilder } from './ui/uiBuilder.js';
import { physicsSystem } from './physics/physicsSystem.js';
import { socialFeaturesGenerator } from './socialFeatures.js'; // 이름 수정
import { metaverseIntegration } from './metaverseIntegration.js';
import { educationalTools } from './educationalTools.js';
import { localizationManager } from './localizationManager.js';
import { registerAiTester } from './aiTester.js';
import { openCloudConnector } from './opencloud/openCloudConnector.js'; // 주석 해제
import { sequentialTestTools } from './sequentialTestTools.js'; // Add test tools
import { logger } from '../utils/logger.js';

// Create a new tool registry
const toolRegistry = new ToolRegistry();

// 간소화된 scriptValidator 등록
if (scriptValidator && typeof scriptValidator.register === 'function') {
  try {
    // any 타입을 사용하여 타입 호환성 문제 우회
    const mockServer: any = {
      tool: (name: string, callback: any) => toolRegistry.add(name, callback)
    };
    scriptValidator.register(mockServer);
  } catch (error) {
    logger.warn('Failed to register scriptValidator', { error: String(error) });
  }
}

// Register scriptGenerator
if (scriptGenerator && typeof scriptGenerator.register === 'function') {
  try {
    // Use any type to bypass type compatibility issues temporarily
    const mockServer: any = {
      tool: (name: string, callback: any) => toolRegistry.add(name, callback)
    };
    scriptGenerator.register(mockServer);
  } catch (error) {
    logger.warn('Failed to register scriptGenerator', { error: String(error) });
  }
}

/**
 * Registry for all Roblex Studio tools
 */
export const roblexTools = {
  register: (server: McpServer) => {
    logger.info('Registering Roblex Studio tools...');
    
    // 직접 도구 등록
    try {
      // 스크립트 검증 도구
      if (scriptValidator && typeof scriptValidator.register === 'function') {
        scriptValidator.register(server);
      }
      
      // 스크립트 생성 도구
      if (scriptGenerator && typeof scriptGenerator.register === 'function') {
        scriptGenerator.register(server);
      }
      
      // AI 테스터 도구
      registerAiTester(server);
      
      // 에셋 파인더 도구 (추가)
      if (assetFinder && typeof assetFinder.register === 'function') {
        assetFinder.register(server);
      }

      // Roblex API 커넥터 도구 (추가)
      if (roblexApiConnector && typeof roblexApiConnector.register === 'function') {
        roblexApiConnector.register(server);
      }

      // 코드 생성 도구
      if (codeGenerator && typeof codeGenerator.register === 'function') {
        codeGenerator.register(server);
      }

      // 데이터스토어 매니저 도구 (추가)
      if (datastoreManager && typeof datastoreManager.register === 'function') {
        datastoreManager.register(server);
      }

      // UI 빌더 도구 (추가)
      if (uiBuilder && typeof uiBuilder.register === 'function') {
        uiBuilder.register(server);
      }

      // 물리 시스템 도구 (추가)
      if (physicsSystem && typeof physicsSystem.register === 'function') {
        physicsSystem.register(server);
      }

      // 소셜 기능 도구 (추가)
      // 소셜 기능 도구 (추가) - register 함수 대신 직접 도구 등록
      if (socialFeaturesGenerator) {
        server.tool(socialFeaturesGenerator.name, socialFeaturesGenerator.description, socialFeaturesGenerator.execute); // parameters 대신 description 전달
      }

      // 메타버스 통합 도구 (추가) - register 함수 대신 직접 도구 등록
      if (metaverseIntegration && typeof (metaverseIntegration as any).execute === 'function') { // execute 함수 존재 여부 확인
        server.tool((metaverseIntegration as any).name, (metaverseIntegration as any).description, (metaverseIntegration as any).execute); // parameters 대신 description 전달
      }

      // 교육 도구 (추가)
      if (educationalTools && typeof educationalTools.register === 'function') {
        educationalTools.register(server);
      }

      // 로컬라이제이션 매니저 도구 (추가) - register 함수 대신 직접 도구 등록
      if (localizationManager && typeof (localizationManager as any).execute === 'function') { // execute 함수 존재 여부 확인
        server.tool((localizationManager as any).name, (localizationManager as any).description, (localizationManager as any).execute); // parameters 대신 description 전달
      }

      // Open Cloud 커넥터 도구 (추가)
      if (openCloudConnector && typeof openCloudConnector.register === 'function') {
        openCloudConnector.register(server);
      }

      // Sequential MCP Test Tools (추가)
      if (sequentialTestTools && typeof sequentialTestTools.register === 'function') {
        sequentialTestTools.register(server);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error registering tools: ${errorMessage}`);
    }
    
    logger.info('Roblex Studio tools registered successfully');
  }
};
=======
import { McpServer } from '../server/McpServer';
import { logger } from '../utils/logger';

// 도구 정의 인터페이스
interface ToolDefinition {
  name: string;
  description: string;
  parameters: any;
  handler: (params: any, context?: any) => Promise<any>;
}

// 도구 정의 예시 (TimeService)
const timeServiceTool: ToolDefinition = {
  name: 'get-current-time',
  description: 'Get the current time in the configured local timezone',
  parameters: {},
  handler: async (_params: any, _context: any) => {
    logger.debug('Time service tool called');
    return { time: new Date().toLocaleString() };
  }
};

// 모든 도구 목록
const allTools: ToolDefinition[] = [
  timeServiceTool,
  // 더 많은 도구를 여기에 추가
];

// 도구 등록 및 관리를 위한 객체
export const roblexTools = {
  /**
   * 서버에 도구 등록
   * @param server MCP 서버 인스턴스
   */
  register: (server: McpServer): void => {
    logger.info(`${allTools.length}개의 도구 등록 중...`);
    allTools.forEach(tool => {
      logger.debug(`도구 등록: ${tool.name}`);
      server.tool(tool.name, tool.description, tool.parameters, tool.handler);
    });
    logger.info('모든 도구 등록 완료');
  },

  /**
   * 등록된 도구 목록 가져오기
   * @returns 도구 정의 목록
   */
  getToolList: (): Array<{ name: string; description: string; parameters: any }> => {
    return allTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }));
  },

  /**
   * 등록된 도구 수 가져오기
   * @returns 도구 수
   */
  getToolCount: (): number => {
    return allTools.length;
  },

  /**
   * 도구 이름으로 도구 찾기
   * @param name 도구 이름
   * @returns 도구 정의 또는 undefined
   */
  getToolByName: (name: string): ToolDefinition | undefined => {
    return allTools.find(tool => tool.name === name);
  }
};
>>>>>>> Stashed changes
