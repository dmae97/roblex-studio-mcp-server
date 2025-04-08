"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roblexApiConnector = void 0;
const zod_1 = require("zod");
const logger_js_1 = require("../utils/logger.js");
const roblexClient_js_1 = require("../api/roblexClient.js");
/**
 * Tool for connecting to the Roblex Studio API
 */
exports.roblexApiConnector = {
    register: (server) => {
        // Create the API client once
        const apiClient = (0, roblexClient_js_1.createRoblexApiClient)();
        // Register search assets tool
        server.tool('roblex-search-assets', {
            // Input schema using Zod
            query: zod_1.z.string().describe('Search query'),
            assetType: zod_1.z.enum(['Model', 'Decal', 'Mesh', 'Animation', 'Sound', 'Texture']).optional().describe('Type of asset to search for'),
            limit: zod_1.z.number().int().positive().max(100).default(10).describe('Maximum number of results'),
            offset: zod_1.z.number().int().nonnegative().default(0).describe('Pagination offset')
        }, async ({ query, assetType, limit, offset }) => {
            logger_js_1.logger.info(`Searching Roblex assets with query: ${query}`);
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
                logger_js_1.logger.error('Error searching assets:', { message: error instanceof Error ? error.message : String(error) });
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
            scriptContent: zod_1.z.string().describe('The Lua script content to validate'),
            scriptType: zod_1.z.enum(['ServerScript', 'LocalScript', 'ModuleScript']).describe('Type of script')
        }, async ({ scriptContent, scriptType }) => {
            logger_js_1.logger.info(`Validating ${scriptType} through Roblex API`);
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
                logger_js_1.logger.error('Error validating script:', { message: error instanceof Error ? error.message : String(error) });
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
            name: zod_1.z.string().describe('Name of the script'),
            type: zod_1.z.enum(['ServerScript', 'LocalScript', 'ModuleScript']).describe('Type of script'),
            content: zod_1.z.string().describe('Script content'),
            parentId: zod_1.z.string().optional().describe('ID of the parent object')
        }, async ({ name, type, content, parentId }) => {
            logger_js_1.logger.info(`Creating ${type} "${name}" through Roblex API`);
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
                logger_js_1.logger.error('Error creating script:', { message: error instanceof Error ? error.message : String(error) });
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
            assetId: zod_1.z.string().describe('ID of the asset to get')
        }, async ({ assetId }) => {
            logger_js_1.logger.info(`Getting asset with ID: ${assetId}`);
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
                logger_js_1.logger.error('Error getting asset:', { message: error instanceof Error ? error.message : String(error) });
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
            userId: zod_1.z.string().describe('ID of the user')
        }, async ({ userId }) => {
            logger_js_1.logger.info(`Getting user profile for user ID: ${userId}`);
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
                logger_js_1.logger.error('Error getting user profile:', { message: error instanceof Error ? error.message : String(error) });
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
        logger_js_1.logger.debug('Roblex API connector tools registered');
    }
};
//# sourceMappingURL=roblexApiConnector.js.map