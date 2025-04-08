import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { createRoblexApiClient } from '../api/roblexClient.js';
/**
 * Tool for connecting to the Roblex Studio API
 */
export const roblexApiConnector = {
    register: (server) => {
        // Create the API client once
        const apiClient = createRoblexApiClient();
        // Register search assets tool
        server.tool('roblex-search-assets', {
            // Input schema using Zod
            query: z.string().describe('Search query'),
            assetType: z.enum(['Model', 'Decal', 'Mesh', 'Animation', 'Sound', 'Texture']).optional().describe('Type of asset to search for'),
            limit: z.number().int().positive().max(100).default(10).describe('Maximum number of results'),
            offset: z.number().int().nonnegative().default(0).describe('Pagination offset')
        }, async ({ query, assetType, limit, offset }) => {
            logger.info(`Searching Roblex assets with query: ${query}`);
            try {
                const results = await apiClient.searchAssets(query, assetType, limit, offset);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(results, null, 2)
                        }
                    ]
                };
            }
            catch (error) {
                logger.error('Error searching assets:', error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error searching assets: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        });
        // Register validate script tool
        server.tool('roblex-validate-script', {
            // Input schema using Zod
            scriptContent: z.string().describe('The Lua script content to validate'),
            scriptType: z.enum(['ServerScript', 'LocalScript', 'ModuleScript']).describe('Type of script')
        }, async ({ scriptContent, scriptType }) => {
            logger.info(`Validating ${scriptType} through Roblex API`);
            try {
                const validation = await apiClient.validateScript({
                    content: scriptContent,
                    type: scriptType
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(validation, null, 2)
                        }
                    ]
                };
            }
            catch (error) {
                logger.error('Error validating script:', error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error validating script: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        });
        // Register create script tool
        server.tool('roblex-create-script', {
            // Input schema using Zod
            name: z.string().describe('Name of the script'),
            type: z.enum(['ServerScript', 'LocalScript', 'ModuleScript']).describe('Type of script'),
            content: z.string().describe('Script content'),
            parentId: z.string().optional().describe('ID of the parent object')
        }, async ({ name, type, content, parentId }) => {
            logger.info(`Creating ${type} "${name}" through Roblex API`);
            try {
                const script = await apiClient.createScript({
                    name,
                    type,
                    content,
                    parentId
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(script, null, 2)
                        }
                    ]
                };
            }
            catch (error) {
                logger.error('Error creating script:', error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error creating script: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        });
        // Register get asset tool
        server.tool('roblex-get-asset', {
            // Input schema using Zod
            assetId: z.string().describe('ID of the asset to get')
        }, async ({ assetId }) => {
            logger.info(`Getting asset with ID: ${assetId}`);
            try {
                const asset = await apiClient.getAsset(assetId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(asset, null, 2)
                        }
                    ]
                };
            }
            catch (error) {
                logger.error('Error getting asset:', error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error getting asset: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        });
        // Register get user profile tool
        server.tool('roblex-get-user-profile', {
            // Input schema using Zod
            userId: z.string().describe('ID of the user')
        }, async ({ userId }) => {
            logger.info(`Getting user profile for user ID: ${userId}`);
            try {
                const profile = await apiClient.getUserProfile(userId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(profile, null, 2)
                        }
                    ]
                };
            }
            catch (error) {
                logger.error('Error getting user profile:', error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error getting user profile: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        });
        logger.debug('Roblex API connector tools registered');
    }
};
//# sourceMappingURL=roblexApiConnector.js.map