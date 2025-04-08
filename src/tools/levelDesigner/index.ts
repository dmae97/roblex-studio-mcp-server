import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../../utils/logger.js';
import { generateLevelCode, generateSetupInstructions, generateBestPractices } from './levelGenerator.js';
import { generateTerrainCode, generateHeightMapDescription, generateTerrainInstructions } from './terrainGenerator.js';
import { generateEnvironmentCode } from './environmentGenerator.js';
import { levelDesignSchema, terrainSchema, environmentSchema } from './schemas.js';

/**
 * Roblox Studio용 레벨 디자이너 도구
 * 
 * 레벨 레이아웃, 지형 디자인, 게임 환경을 생성하는 도구 제공
 */
export const levelDesigner = {
  register: (server: McpServer) => {
    // 레벨 레이아웃 생성
    (server as any).tool(
      'create-level-layout',
      levelDesignSchema,
      async (params: any) => {
        logger.info(`Creating level layout of type: ${params.levelType}`);
        
        try {
          const layoutCode = generateLevelCode(params);
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                levelCode: layoutCode,
                setupInstructions: generateSetupInstructions(params),
                bestPractices: generateBestPractices(params.levelType),
              }, null, 2)
            }]
          };
        } catch (error: any) {
          logger.error('Error creating level layout:', error);
          return {
            content: [{
              type: 'text',
              text: `Failed to create level layout: ${error.message}`
            }],
            isError: true
          };
        }
      }
    );
    
    // 지형 생성
    (server as any).tool(
      'generate-terrain',
      terrainSchema,
      async (params: any) => {
        logger.info(`Generating ${params.terrainType} terrain`);
        
        try {
          const terrainCode = generateTerrainCode(params);
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                terrainCode: terrainCode,
                heightMap: generateHeightMapDescription(params),
                setupInstructions: generateTerrainInstructions(params)
              }, null, 2)
            }]
          };
        } catch (error: any) {
          logger.error('Error generating terrain:', error);
          return {
            content: [{
              type: 'text',
              text: `Failed to generate terrain: ${error.message}`
            }],
            isError: true
          };
        }
      }
    );
    
    // 환경 설정 생성
    (server as any).tool(
      'create-environment-settings',
      environmentSchema,
      async (params: any) => {
        logger.info('Creating environment settings');
        
        try {
          const environmentCode = generateEnvironmentCode(params);
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                environmentCode: environmentCode,
                setupInstructions: 'Place the script in ServerScriptService and run the game to apply these environment settings.'
              }, null, 2)
            }]
          };
        } catch (error: any) {
          logger.error('Error creating environment settings:', error);
          return {
            content: [{
              type: 'text',
              text: `Failed to create environment settings: ${error.message}`
            }],
            isError: true
          };
        }
      }
    );

    logger.info('레벨 디자이너 도구가 등록되었습니다.');
  }
};