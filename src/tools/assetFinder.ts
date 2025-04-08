import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

/**
 * Tool for finding Roblex assets based on user criteria
 */
export const assetFinder = {
  register: (server: McpServer) => {
    (server as any).tool(
      'find-assets',
      {
        query: z.string().describe('Search query for assets'),
        assetType: z.enum(['image', 'model', 'audio', 'script', 'all']).optional().describe('Type of asset to search for'),
        limit: z.number().int().positive().optional().default(10).describe('Maximum number of results')
      },
      async (params: any) => {
        // Temporary use of 'any' for params
        const { query, assetType, limit } = params;
        logger.info('Finding assets', { query, assetType, limit });

        try {
          // Simulate finding assets (replace with actual API call or logic)
          const mockAssets = [
            { id: '123', name: 'Cool Sword', type: 'model', url: 'roblox.com/library/123' },
            { id: '456', name: 'Background Music', type: 'audio', url: 'roblox.com/library/456' },
            { id: '789', name: 'Player Script', type: 'script', url: 'roblox.com/library/789' }
          ];

          const filteredAssets = mockAssets
            .filter(asset => asset.name.toLowerCase().includes(query.toLowerCase()))
            .filter(asset => !assetType || assetType === 'all' || asset.type === assetType)
            .slice(0, limit);

          if (filteredAssets.length === 0) {
            return {
              content: [{
                type: 'text',
                text: `No assets found matching query: "${query}"${assetType ? ` of type ${assetType}` : ''}`
              }]
            };
          }

          return {
            content: [
              {
                type: 'text',
                text: `Found ${filteredAssets.length} assets:\n${filteredAssets.map(a => `- ${a.name} (${a.type}): ${a.url}`).join('\n')}`
              }
            ]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          // Ensure the second argument to logger.error is an object, standardizing on { err: error }
          logger.error('Error finding assets', { err: error }); // Pass the original error object
          return {
            content: [{
              type: 'text',
              text: `Error finding assets: ${errorMessage}`
            }],
            isError: true
          };
        }
      }
    );
    logger.debug('Asset finder tool registered');
  }
};
