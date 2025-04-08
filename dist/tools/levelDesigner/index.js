import { logger } from '../../utils/logger.js';
import { generateLevelCode, generateSetupInstructions, generateBestPractices } from './levelGenerator.js';
import { generateTerrainCode, generateHeightMapDescription, generateTerrainInstructions } from './terrainGenerator.js';
import { generateEnvironmentCode } from './environmentGenerator.js';
import { levelDesignSchema, terrainSchema, environmentSchema } from './schemas.js';
/**
 * Level Designer Tool for Roblox Studio
 *
 * Provides tools to generate level layouts, terrain designs, and game environments
 */
export const levelDesigner = {
    register: (server) => {
        // Create Level Layout
        server.registerTool('create-level-layout', {
            description: 'Creates a level layout for different game types in Roblox',
            parameters: levelDesignSchema,
        }, async (params) => {
            logger.info(`Creating level layout of type: ${params.levelType}`);
            try {
                const layoutCode = generateLevelCode(params);
                return {
                    levelCode: layoutCode,
                    setupInstructions: generateSetupInstructions(params),
                    bestPractices: generateBestPractices(params.levelType),
                };
            }
            catch (error) {
                logger.error('Error creating level layout:', error);
                throw new Error(`Failed to create level layout: ${error.message}`);
            }
        });
        // Generate Terrain
        server.registerTool('generate-terrain', {
            description: 'Generates terrain configurations for Roblox games',
            parameters: terrainSchema,
        }, async (params) => {
            logger.info(`Generating ${params.terrainType} terrain`);
            try {
                const terrainCode = generateTerrainCode(params);
                return {
                    terrainCode: terrainCode,
                    heightMap: generateHeightMapDescription(params),
                    setupInstructions: generateTerrainInstructions(params)
                };
            }
            catch (error) {
                logger.error('Error generating terrain:', error);
                throw new Error(`Failed to generate terrain: ${error.message}`);
            }
        });
        // Create Environment Settings
        server.registerTool('create-environment-settings', {
            description: 'Creates environment settings including lighting, atmosphere, and sound',
            parameters: environmentSchema,
        }, async (params) => {
            logger.info('Creating environment settings');
            try {
                const environmentCode = generateEnvironmentCode(params);
                return {
                    environmentCode: environmentCode,
                    setupInstructions: 'Place the script in ServerScriptService and run the game to apply these environment settings.'
                };
            }
            catch (error) {
                logger.error('Error creating environment settings:', error);
                throw new Error(`Failed to create environment settings: ${error.message}`);
            }
        });
    }
};
//# sourceMappingURL=index.js.map