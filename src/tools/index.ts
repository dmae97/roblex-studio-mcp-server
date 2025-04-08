import { McpServer } from '../server/McpServer.js';
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
// import { aiTester } from './aiTester.js';
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
  // any 타입을 사용하여 타입 호환성 문제 우회
  register: (server: any) => {
    logger.info('Registering Roblex Studio tools...');
    
    // Register all tools from the registry
    toolRegistry.register(server);
    
    logger.info('Roblex Studio tools registered successfully');
  }
};
