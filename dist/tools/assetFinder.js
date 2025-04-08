import { z } from 'zod';
import { logger } from '../utils/logger.js';
/**
 * Tool for finding Roblex assets based on user criteria
 */
export const assetFinder = {
    register: (server) => {
        server.tool('find-roblex-assets', {
            // Input schema using Zod
            assetType: z.enum(['Model', 'Decal', 'Mesh', 'Animation', 'Sound', 'Texture']),
            keywords: z.string().describe('Search keywords or tags'),
            maxResults: z.number().int().positive().default(10).describe('Maximum number of results to return'),
            includeDetails: z.boolean().default(true).describe('Whether to include detailed asset information')
        }, async ({ assetType, keywords, maxResults, includeDetails }) => {
            logger.info(`Searching for ${assetType} assets with keywords: ${keywords}`);
            try {
                // In a real implementation, this would query a database or API
                // Here we'll simulate some results
                const mockAssets = [
                    {
                        id: '12345678',
                        name: 'Sample Asset 1',
                        type: assetType,
                        creator: 'RoblexUser123',
                        created: '2024-04-01T12:00:00Z',
                        updated: '2024-04-02T14:30:00Z',
                        description: `A great ${assetType.toLowerCase()} that matches "${keywords}"`,
                        tags: keywords.split(',').map(k => k.trim()),
                        downloadUrl: 'https://example.com/asset/12345678',
                        thumbnailUrl: 'https://example.com/thumbnail/12345678.png',
                    },
                    {
                        id: '87654321',
                        name: 'Sample Asset 2',
                        type: assetType,
                        creator: 'RoblexStudio',
                        created: '2024-03-15T09:45:00Z',
                        updated: '2024-03-25T11:20:00Z',
                        description: `Another ${assetType.toLowerCase()} related to "${keywords}"`,
                        tags: ['sample', 'demo', ...keywords.split(',').map(k => k.trim())],
                        downloadUrl: 'https://example.com/asset/87654321',
                        thumbnailUrl: 'https://example.com/thumbnail/87654321.png',
                    }
                ];
                // Limit results based on maxResults parameter
                const limitedResults = mockAssets.slice(0, maxResults);
                // Format results based on includeDetails parameter
                const formattedResults = limitedResults.map(asset => {
                    if (includeDetails) {
                        return asset;
                    }
                    else {
                        // Simplified version with just the essential information
                        return {
                            id: asset.id,
                            name: asset.name,
                            type: asset.type,
                            creator: asset.creator,
                            thumbnailUrl: asset.thumbnailUrl
                        };
                    }
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                assets: formattedResults,
                                totalFound: mockAssets.length,
                                returned: formattedResults.length
                            }, null, 2)
                        }
                    ]
                };
            }
            catch (error) {
                logger.error('Error finding assets:', error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error finding assets: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        });
        logger.debug('Asset finder tool registered');
    }
};
//# sourceMappingURL=assetFinder.js.map