import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ToolRegistry } from '../server/McpHelpers.js';
import { scriptGenerator } from './scriptGenerator.js'; // Import the new tool
// import { assetFinder } from './assetFinder.js';
import { scriptValidator } from './scriptValidator.js';
// import { roblexApiConnector } from './roblexApiConnector.js';
// import { datastoreManager } from './datastore/datastoreManager.js';
// import { uiBuilder } from './ui/uiBuilder.js';
// import { physicsSystem } from './physics/physicsSystem.js';
// import { socialFeatures } from './socialFeatures.js';
// import { metaverseIntegration } from './metaverseIntegration.js';
// import { educationalTools } from './educationalTools.js';
// import { localizationManager } from './localizationManager.js';
import { registerAiTester } from './aiTester.js';
// import { openCloudConnector } from './opencloud/openCloudConnector.js';
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
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error registering tools: ${errorMessage}`);
    }
    
    logger.info('Roblex Studio tools registered successfully');
  }
};
