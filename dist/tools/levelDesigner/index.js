"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.levelDesigner = void 0;
const logger_js_1 = require("../../utils/logger.js");
const levelGenerator_js_1 = require("./levelGenerator.js");
const terrainGenerator_js_1 = require("./terrainGenerator.js");
const environmentGenerator_js_1 = require("./environmentGenerator.js");
const schemas_js_1 = require("./schemas.js");
/**
 * Roblox Studio용 레벨 디자이너 도구
 *
 * 레벨 레이아웃, 지형 디자인, 게임 환경을 생성하는 도구 제공
 */
exports.levelDesigner = {
    register: (server) => {
        // 레벨 레이아웃 생성
        server.tool('create-level-layout', schemas_js_1.levelDesignSchema, async (params) => {
            logger_js_1.logger.info(`Creating level layout of type: ${params.levelType}`);
            try {
                const layoutCode = (0, levelGenerator_js_1.generateLevelCode)(params);
                return {
                    content: [{
                            type: 'text',
                            text: JSON.stringify({
                                levelCode: layoutCode,
                                setupInstructions: (0, levelGenerator_js_1.generateSetupInstructions)(params),
                                bestPractices: (0, levelGenerator_js_1.generateBestPractices)(params.levelType),
                            }, null, 2)
                        }]
                };
            }
            catch (error) {
                logger_js_1.logger.error('Error creating level layout:', error);
                return {
                    content: [{
                            type: 'text',
                            text: `Failed to create level layout: ${error.message}`
                        }],
                    isError: true
                };
            }
        });
        // 지형 생성
        server.tool('generate-terrain', schemas_js_1.terrainSchema, async (params) => {
            logger_js_1.logger.info(`Generating ${params.terrainType} terrain`);
            try {
                const terrainCode = (0, terrainGenerator_js_1.generateTerrainCode)(params);
                return {
                    content: [{
                            type: 'text',
                            text: JSON.stringify({
                                terrainCode: terrainCode,
                                heightMap: (0, terrainGenerator_js_1.generateHeightMapDescription)(params),
                                setupInstructions: (0, terrainGenerator_js_1.generateTerrainInstructions)(params)
                            }, null, 2)
                        }]
                };
            }
            catch (error) {
                logger_js_1.logger.error('Error generating terrain:', error);
                return {
                    content: [{
                            type: 'text',
                            text: `Failed to generate terrain: ${error.message}`
                        }],
                    isError: true
                };
            }
        });
        // 환경 설정 생성
        server.tool('create-environment-settings', schemas_js_1.environmentSchema, async (params) => {
            logger_js_1.logger.info('Creating environment settings');
            try {
                const environmentCode = (0, environmentGenerator_js_1.generateEnvironmentCode)(params);
                return {
                    content: [{
                            type: 'text',
                            text: JSON.stringify({
                                environmentCode: environmentCode,
                                setupInstructions: 'Place the script in ServerScriptService and run the game to apply these environment settings.'
                            }, null, 2)
                        }]
                };
            }
            catch (error) {
                logger_js_1.logger.error('Error creating environment settings:', error);
                return {
                    content: [{
                            type: 'text',
                            text: `Failed to create environment settings: ${error.message}`
                        }],
                    isError: true
                };
            }
        });
        logger_js_1.logger.info('레벨 디자이너 도구가 등록되었습니다.');
    }
};
//# sourceMappingURL=index.js.map