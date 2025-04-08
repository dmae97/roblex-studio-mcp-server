"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roblexTools = void 0;
const McpHelpers_js_1 = require("../server/McpHelpers.js");
const scriptGenerator_js_1 = require("./scriptGenerator.js"); // Import the new tool
// import { assetFinder } from './assetFinder.js';
const scriptValidator_js_1 = require("./scriptValidator.js");
// import { roblexApiConnector } from './roblexApiConnector.js';
// import { datastoreManager } from './datastore/datastoreManager.js';
// import { uiBuilder } from './ui/uiBuilder.js';
// import { physicsSystem } from './physics/physicsSystem.js';
// import { socialFeatures } from './socialFeatures.js';
// import { metaverseIntegration } from './metaverseIntegration.js';
// import { educationalTools } from './educationalTools.js';
// import { localizationManager } from './localizationManager.js';
const aiTester_js_1 = require("./aiTester.js");
// import { openCloudConnector } from './opencloud/openCloudConnector.js';
const logger_js_1 = require("../utils/logger.js");
// Create a new tool registry
const toolRegistry = new McpHelpers_js_1.ToolRegistry();
// 간소화된 scriptValidator 등록
if (scriptValidator_js_1.scriptValidator && typeof scriptValidator_js_1.scriptValidator.register === 'function') {
    try {
        // any 타입을 사용하여 타입 호환성 문제 우회
        const mockServer = {
            tool: (name, callback) => toolRegistry.add(name, callback)
        };
        scriptValidator_js_1.scriptValidator.register(mockServer);
    }
    catch (error) {
        logger_js_1.logger.warn('Failed to register scriptValidator', { error: String(error) });
    }
}
// Register scriptGenerator
if (scriptGenerator_js_1.scriptGenerator && typeof scriptGenerator_js_1.scriptGenerator.register === 'function') {
    try {
        // Use any type to bypass type compatibility issues temporarily
        const mockServer = {
            tool: (name, callback) => toolRegistry.add(name, callback)
        };
        scriptGenerator_js_1.scriptGenerator.register(mockServer);
    }
    catch (error) {
        logger_js_1.logger.warn('Failed to register scriptGenerator', { error: String(error) });
    }
}
/**
 * Registry for all Roblex Studio tools
 */
exports.roblexTools = {
    register: (server) => {
        logger_js_1.logger.info('Registering Roblex Studio tools...');
        // 직접 도구 등록
        try {
            // 스크립트 검증 도구
            if (scriptValidator_js_1.scriptValidator && typeof scriptValidator_js_1.scriptValidator.register === 'function') {
                scriptValidator_js_1.scriptValidator.register(server);
            }
            // 스크립트 생성 도구
            if (scriptGenerator_js_1.scriptGenerator && typeof scriptGenerator_js_1.scriptGenerator.register === 'function') {
                scriptGenerator_js_1.scriptGenerator.register(server);
            }
            // AI 테스터 도구
            (0, aiTester_js_1.registerAiTester)(server);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger_js_1.logger.error(`Error registering tools: ${errorMessage}`);
        }
        logger_js_1.logger.info('Roblex Studio tools registered successfully');
    }
};
//# sourceMappingURL=index.js.map