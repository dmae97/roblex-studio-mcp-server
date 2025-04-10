"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openCloudConnector = void 0;
// McpToolResult and McpTool are likely deprecated. Use standard Promise/object return types.
// import { McpToolResult, McpTool } from '@modelcontextprotocol/sdk/server/index.js';
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
// @ts-ignore
const logger_js_1 = require("../../utils/logger.js");
// Define Zod schemas for tool parameters
const listUniversesSchema = zod_1.z.object({}); // No parameters needed
const getUniverseSchema = zod_1.z.object({
    universeId: zod_1.z.string().describe('The ID of the universe to retrieve')
});
const publishPlaceSchema = zod_1.z.object({
    universeId: zod_1.z.string().describe('Universe ID containing the place'),
    placeId: zod_1.z.string().describe('ID of the place to publish'),
    versionType: zod_1.z.enum(['Saved', 'Published']).describe('Version type to publish')
});
/**
 * Toolset for interacting with Roblox Open Cloud APIs.
 */
const openCloudConnector = {
    apiKey: process.env.OPENCLOUD_API_KEY, // Load API key from environment
    baseUrl: 'https://apis.roblox.com/cloud/v2',
    async _makeRequest(method, path, data) {
        if (!this.apiKey) {
            throw new Error('Open Cloud API key is not configured.');
        }
        try {
            const response = await (0, axios_1.default)({
                method,
                url: `${this.baseUrl}/${path}`,
                headers: {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                },
                data: data ? JSON.stringify(data) : undefined
            });
            return response.data;
        }
        catch (error) {
            const status = error.response?.status;
            const message = error.response?.data?.message || error.message;
            logger_js_1.logger.error('Open Cloud API request failed', { status, message, path, err: error });
            // Re-throw a more specific error if needed, or return an error structure
            throw new Error(`Open Cloud API Error (${status}): ${message}`);
        }
    },
    // Registration method
    register: (server) => {
        logger_js_1.logger.info('Registering Open Cloud Connector tools...');
        // List Universes Tool
        server.tool('oc-list-universes', 'List all universes accessible with the configured API key.', listUniversesSchema.shape, // Pass shape instead of ZodObject
        async (params) => {
            try {
                const result = await openCloudConnector._makeRequest('get', 'universes');
                return {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                // logger.error already called in _makeRequest
                return { content: [{ type: 'text', text: `Error listing universes: ${errorMessage}` }], isError: true };
            }
        });
        // Get Universe Tool
        server.tool('oc-get-universe', 'Get details for a specific universe by ID.', getUniverseSchema.shape, async ({ universeId }) => {
            try {
                const result = await openCloudConnector._makeRequest('get', `universes/${universeId}`);
                return {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                return { content: [{ type: 'text', text: `Error getting universe ${universeId}: ${errorMessage}` }], isError: true };
            }
        });
        // Publish Place Tool
        server.tool('oc-publish-place', 'Publish a specific version of a place within a universe.', publishPlaceSchema.shape, async ({ universeId, placeId, versionType }) => {
            try {
                const path = `universes/${universeId}/places/${placeId}/versions`;
                const data = { versionType: versionType }; // Payload as per Open Cloud API docs
                const result = await openCloudConnector._makeRequest('post', path, data);
                return {
                    content: [{ type: 'text', text: `Publish result for place ${placeId}: ${JSON.stringify(result, null, 2)}` }]
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                return { content: [{ type: 'text', text: `Error publishing place ${placeId}: ${errorMessage}` }], isError: true };
            }
        });
        logger_js_1.logger.info('Open Cloud Connector tools registered.');
    }
};
exports.openCloudConnector = openCloudConnector;
//# sourceMappingURL=openCloudConnector.js.map