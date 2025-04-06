import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { codeGenerator } from './codeGenerator.js';
import { assetFinder } from './assetFinder.js';
import { scriptValidator } from './scriptValidator.js';
import { roblexApiConnector } from './roblexApiConnector.js';
import { datastoreManager } from './datastore/datastoreManager.js';
import { uiBuilder } from './ui/uiBuilder.js';
import { physicsSystem } from './physics/physicsSystem.js';
import { socialFeatures } from './socialFeatures.js';
import { metaverseIntegration } from './metaverseIntegration.js';
import { educationalTools } from './educationalTools.js';
import { localizationManager } from './localizationManager.js';
import { aiTester } from './aiTester.js';
import { openCloudConnector } from './opencloud/openCloudConnector.js';
import { logger } from '../utils/logger.js';

/**
 * Registry for all Roblex Studio tools
 */
export const roblexTools = {
  register: (server: McpServer) => {
    logger.info('Registering Roblex Studio tools...');
    
    // Register core tools
    codeGenerator.register(server);
    assetFinder.register(server);
    scriptValidator.register(server);
    roblexApiConnector.register(server);
    
    // Register new tools
    datastoreManager.register(server);
    uiBuilder.register(server);
    physicsSystem.register(server);
    openCloudConnector.register(server);
    
    // Register additional tools
    socialFeatures.register(server);
    metaverseIntegration.register(server);
    educationalTools.register(server);
    localizationManager.register(server);
    aiTester.register(server);
    
    logger.info('Roblex Studio tools registered successfully');
  }
};
