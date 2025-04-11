"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roblexTools = void 0;
<<<<<<< Updated upstream
const McpHelpers_js_1 = require("../server/McpHelpers.js");
const scriptGenerator_js_1 = require("./scriptGenerator.js"); // Import the new tool
const assetFinder_js_1 = require("./assetFinder.js");
const scriptValidator_js_1 = require("./scriptValidator.js");
const roblexApiConnector_js_1 = require("./roblexApiConnector.js");
const codeGenerator_js_1 = require("./codeGenerator.js"); // 추가
const datastoreManager_js_1 = __importDefault(require("./datastore/datastoreManager.js")); // 기본 가져오기로 수정
const uiBuilder_js_1 = require("./ui/uiBuilder.js");
const physicsSystem_js_1 = require("./physics/physicsSystem.js");
const socialFeatures_js_1 = require("./socialFeatures.js"); // 이름 수정
const metaverseIntegration_js_1 = require("./metaverseIntegration.js");
const educationalTools_js_1 = require("./educationalTools.js");
const localizationManager_js_1 = require("./localizationManager.js");
const aiTester_js_1 = require("./aiTester.js");
const openCloudConnector_js_1 = require("./opencloud/openCloudConnector.js"); // 주석 해제
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
=======
const logger_1 = require("../utils/logger");
// 도구 정의 예시 (TimeService)
const timeServiceTool = {
    name: 'get-current-time',
    description: 'Get the current time in the configured local timezone',
    parameters: {},
    handler: async (_params, _context) => {
        logger_1.logger.debug('Time service tool called');
        return { time: new Date().toLocaleString() };
    }
};
// 모든 도구 목록
const allTools = [
    timeServiceTool,
    // 더 많은 도구를 여기에 추가
];
// 도구 등록 및 관리를 위한 객체
>>>>>>> Stashed changes
exports.roblexTools = {
    /**
     * 서버에 도구 등록
     * @param server MCP 서버 인스턴스
     */
    register: (server) => {
<<<<<<< Updated upstream
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
            // 에셋 파인더 도구 (추가)
            if (assetFinder_js_1.assetFinder && typeof assetFinder_js_1.assetFinder.register === 'function') {
                assetFinder_js_1.assetFinder.register(server);
            }
            // Roblex API 커넥터 도구 (추가)
            if (roblexApiConnector_js_1.roblexApiConnector && typeof roblexApiConnector_js_1.roblexApiConnector.register === 'function') {
                roblexApiConnector_js_1.roblexApiConnector.register(server);
            }
            // 코드 생성 도구
            if (codeGenerator_js_1.codeGenerator && typeof codeGenerator_js_1.codeGenerator.register === 'function') {
                codeGenerator_js_1.codeGenerator.register(server);
            }
            // 데이터스토어 매니저 도구 (추가)
            if (datastoreManager_js_1.default && typeof datastoreManager_js_1.default.register === 'function') {
                datastoreManager_js_1.default.register(server);
            }
            // UI 빌더 도구 (추가)
            if (uiBuilder_js_1.uiBuilder && typeof uiBuilder_js_1.uiBuilder.register === 'function') {
                uiBuilder_js_1.uiBuilder.register(server);
            }
            // 물리 시스템 도구 (추가)
            if (physicsSystem_js_1.physicsSystem && typeof physicsSystem_js_1.physicsSystem.register === 'function') {
                physicsSystem_js_1.physicsSystem.register(server);
            }
            // 소셜 기능 도구 (추가)
            // 소셜 기능 도구 (추가) - register 함수 대신 직접 도구 등록
            if (socialFeatures_js_1.socialFeaturesGenerator) {
                server.tool(socialFeatures_js_1.socialFeaturesGenerator.name, socialFeatures_js_1.socialFeaturesGenerator.description, socialFeatures_js_1.socialFeaturesGenerator.execute); // parameters 대신 description 전달
            }
            // 메타버스 통합 도구 (추가) - register 함수 대신 직접 도구 등록
            if (metaverseIntegration_js_1.metaverseIntegration && typeof metaverseIntegration_js_1.metaverseIntegration.execute === 'function') { // execute 함수 존재 여부 확인
                server.tool(metaverseIntegration_js_1.metaverseIntegration.name, metaverseIntegration_js_1.metaverseIntegration.description, metaverseIntegration_js_1.metaverseIntegration.execute); // parameters 대신 description 전달
            }
            // 교육 도구 (추가)
            if (educationalTools_js_1.educationalTools && typeof educationalTools_js_1.educationalTools.register === 'function') {
                educationalTools_js_1.educationalTools.register(server);
            }
            // 로컬라이제이션 매니저 도구 (추가) - register 함수 대신 직접 도구 등록
            if (localizationManager_js_1.localizationManager && typeof localizationManager_js_1.localizationManager.execute === 'function') { // execute 함수 존재 여부 확인
                server.tool(localizationManager_js_1.localizationManager.name, localizationManager_js_1.localizationManager.description, localizationManager_js_1.localizationManager.execute); // parameters 대신 description 전달
            }
            // Open Cloud 커넥터 도구 (추가)
            if (openCloudConnector_js_1.openCloudConnector && typeof openCloudConnector_js_1.openCloudConnector.register === 'function') {
                openCloudConnector_js_1.openCloudConnector.register(server);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger_js_1.logger.error(`Error registering tools: ${errorMessage}`);
        }
        logger_js_1.logger.info('Roblex Studio tools registered successfully');
=======
        logger_1.logger.info(`${allTools.length}개의 도구 등록 중...`);
        allTools.forEach(tool => {
            logger_1.logger.debug(`도구 등록: ${tool.name}`);
            server.tool(tool.name, tool.description, tool.parameters, tool.handler);
        });
        logger_1.logger.info('모든 도구 등록 완료');
    },
    /**
     * 등록된 도구 목록 가져오기
     * @returns 도구 정의 목록
     */
    getToolList: () => {
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
    getToolCount: () => {
        return allTools.length;
    },
    /**
     * 도구 이름으로 도구 찾기
     * @param name 도구 이름
     * @returns 도구 정의 또는 undefined
     */
    getToolByName: (name) => {
        return allTools.find(tool => tool.name === name);
>>>>>>> Stashed changes
    }
};
//# sourceMappingURL=index.js.map