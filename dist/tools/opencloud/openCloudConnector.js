import { z } from 'zod';
import axios from 'axios';
import NodeCache from 'node-cache';
import { logger } from '../../utils/logger.js';
// Cache for API results
const apiCache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache time
// Environment variables
const OPENCLOUD_API_KEY = process.env.ROBLOX_OPEN_CLOUD_API_KEY || '';
const DEFAULT_UNIVERSE_ID = process.env.ROBLOX_OPEN_CLOUD_UNIVERSE_ID || '';
// Base API URL
const OPENCLOUD_API_BASE_URL = 'https://apis.roblox.com/cloud';
// Schema for Open Cloud connector parameters
const OpenCloudConnectorParamsSchema = z.object({
    feature: z.enum([
        'DataStores',
        'MessagingService',
        'PlacePublishing',
        'GameConfig',
        'PlayerModeration',
        'Analytics',
        'PlaceManagement'
    ]).describe('Open Cloud feature to use'),
    universeId: z.string().optional()
        .describe('Universe ID to operate on (defaults to environment variable)'),
    actionType: z.enum([
        'get',
        'list',
        'create',
        'update',
        'delete',
        'publish',
        'message',
        'moderate',
        'query'
    ]).describe('Type of action to perform'),
    parameters: z.record(z.any()).optional()
        .describe('Parameters specific to the chosen feature and action'),
    forceRefresh: z.boolean().default(false)
        .describe('Whether to bypass cache and force a fresh API call')
});
/**
 * Provides access to Roblox Open Cloud API features
 */
export const openCloudConnector = {
    name: 'roblox-open-cloud',
    description: 'Provides access to Roblox Open Cloud API features for game management and integration',
    parameters: OpenCloudConnectorParamsSchema,
    execute: async (params) => {
        // Check for API key
        if (!OPENCLOUD_API_KEY) {
            return {
                error: {
                    message: 'Roblox Open Cloud API key not configured',
                    details: 'Set ROBLOX_OPEN_CLOUD_API_KEY in your .env file'
                }
            };
        }
        // Use provided universe ID or default
        const universeId = params.universeId || DEFAULT_UNIVERSE_ID;
        // Check for universe ID
        if (!universeId) {
            return {
                error: {
                    message: 'Universe ID not provided',
                    details: 'Provide universeId parameter or set ROBLOX_OPEN_CLOUD_UNIVERSE_ID in your .env file'
                }
            };
        }
        logger.info(`Executing Open Cloud API operation: ${params.feature} - ${params.actionType}`);
        try {
            // Check cache if not forcing refresh
            const cacheKey = `${params.feature}-${params.actionType}-${universeId}-${JSON.stringify(params.parameters || {})}`;
            if (!params.forceRefresh) {
                const cachedResult = apiCache.get(cacheKey);
                if (cachedResult) {
                    logger.info(`Returning cached result for ${cacheKey}`);
                    return { content: cachedResult };
                }
            }
            // Execute specific action based on feature
            let result;
            switch (params.feature) {
                case 'DataStores':
                    result = await handleDataStoresAction(params.actionType, universeId, params.parameters || {});
                    break;
                case 'MessagingService':
                    result = await handleMessagingAction(params.actionType, universeId, params.parameters || {});
                    break;
                case 'PlacePublishing':
                    result = await handlePlacePublishingAction(params.actionType, universeId, params.parameters || {});
                    break;
                case 'GameConfig':
                    result = await handleGameConfigAction(params.actionType, universeId, params.parameters || {});
                    break;
                case 'PlayerModeration':
                    result = await handlePlayerModerationAction(params.actionType, universeId, params.parameters || {});
                    break;
                case 'Analytics':
                    result = await handleAnalyticsAction(params.actionType, universeId, params.parameters || {});
                    break;
                case 'PlaceManagement':
                    result = await handlePlaceManagementAction(params.actionType, universeId, params.parameters || {});
                    break;
                default:
                    return {
                        error: {
                            message: 'Invalid feature specified',
                            details: `Supported features: DataStores, MessagingService, PlacePublishing, GameConfig, PlayerModeration, Analytics, PlaceManagement`
                        }
                    };
            }
            // Cache successful result
            apiCache.set(cacheKey, result);
            return { content: result };
        }
        catch (error) {
            logger.error(`Error executing Open Cloud API operation: ${error}`);
            if (axios.isAxiosError(error)) {
                return {
                    error: {
                        message: 'Open Cloud API request failed',
                        details: error.response?.data?.message || error.message || 'Unknown error'
                    }
                };
            }
            return {
                error: {
                    message: 'Open Cloud operation failed',
                    details: String(error)
                }
            };
        }
    },
    register: (server) => {
        server.tools.add(openCloudConnector);
        logger.info('Open Cloud Connector tool registered');
    }
};
/**
 * Handle DataStores API actions
 */
async function handleDataStoresAction(actionType, universeId, parameters) {
    const baseUrl = `${OPENCLOUD_API_BASE_URL}/v2/universes/${universeId}/data-stores`;
    switch (actionType) {
        case 'list':
            // List all datastores for the universe
            const { prefix, limit, cursor } = parameters;
            let url = baseUrl;
            const queryParams = [];
            if (prefix)
                queryParams.push(`prefix=${encodeURIComponent(prefix)}`);
            if (limit)
                queryParams.push(`limit=${limit}`);
            if (cursor)
                queryParams.push(`cursor=${encodeURIComponent(cursor)}`);
            if (queryParams.length > 0) {
                url += `?${queryParams.join('&')}`;
            }
            const response = await axios.get(url, {
                headers: {
                    'x-api-key': OPENCLOUD_API_KEY
                }
            });
            return response.data;
        case 'get':
            // Get a specific datastore entry
            const { dataStore, entryKey, scope = 'global' } = parameters;
            if (!dataStore)
                throw new Error('dataStore parameter is required');
            if (!entryKey)
                throw new Error('entryKey parameter is required');
            const getUrl = `${baseUrl}/${encodeURIComponent(dataStore)}/entries/${encodeURIComponent(entryKey)}?scope=${encodeURIComponent(scope)}`;
            const getResponse = await axios.get(getUrl, {
                headers: {
                    'x-api-key': OPENCLOUD_API_KEY
                }
            });
            return getResponse.data;
        case 'create':
        case 'update':
            // Set a datastore entry
            const { dataStore: setDataStore, entryKey: setEntryKey, scope: setScope = 'global', data } = parameters;
            if (!setDataStore)
                throw new Error('dataStore parameter is required');
            if (!setEntryKey)
                throw new Error('entryKey parameter is required');
            if (data === undefined)
                throw new Error('data parameter is required');
            const setUrl = `${baseUrl}/${encodeURIComponent(setDataStore)}/entries/${encodeURIComponent(setEntryKey)}?scope=${encodeURIComponent(setScope)}`;
            const setResponse = await axios.post(setUrl, data, {
                headers: {
                    'x-api-key': OPENCLOUD_API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            return setResponse.data;
        case 'delete':
            // Delete a datastore entry
            const { dataStore: deleteDataStore, entryKey: deleteEntryKey, scope: deleteScope = 'global' } = parameters;
            if (!deleteDataStore)
                throw new Error('dataStore parameter is required');
            if (!deleteEntryKey)
                throw new Error('entryKey parameter is required');
            const deleteUrl = `${baseUrl}/${encodeURIComponent(deleteDataStore)}/entries/${encodeURIComponent(deleteEntryKey)}?scope=${encodeURIComponent(deleteScope)}`;
            const deleteResponse = await axios.delete(deleteUrl, {
                headers: {
                    'x-api-key': OPENCLOUD_API_KEY
                }
            });
            return deleteResponse.data;
        default:
            throw new Error(`Unsupported action type for DataStores: ${actionType}`);
    }
}
/**
 * Handle MessagingService API actions
 */
async function handleMessagingAction(actionType, universeId, parameters) {
    const baseUrl = `${OPENCLOUD_API_BASE_URL}/v1/universes/${universeId}/messaging`;
    switch (actionType) {
        case 'message':
            // Publish a message to all servers
            const { topic, message } = parameters;
            if (!topic)
                throw new Error('topic parameter is required');
            if (message === undefined)
                throw new Error('message parameter is required');
            const url = `${baseUrl}/topics/${encodeURIComponent(topic)}`;
            const response = await axios.post(url, { message }, {
                headers: {
                    'x-api-key': OPENCLOUD_API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            return {
                success: true,
                status: response.status,
                message: 'Message published successfully'
            };
        default:
            throw new Error(`Unsupported action type for MessagingService: ${actionType}`);
    }
}
/**
 * Handle PlacePublishing API actions
 */
async function handlePlacePublishingAction(actionType, universeId, parameters) {
    const baseUrl = `${OPENCLOUD_API_BASE_URL}/v2/universes/${universeId}/places`;
    switch (actionType) {
        case 'publish':
            // Publish a place
            const { placeId, versionType = 'Published', fileData, fileType = 'RBXLX' } = parameters;
            if (!placeId)
                throw new Error('placeId parameter is required');
            if (!fileData)
                throw new Error('fileData parameter is required');
            const url = `${baseUrl}/${placeId}/versions?versionType=${versionType}`;
            const response = await axios.post(url, fileData, {
                headers: {
                    'x-api-key': OPENCLOUD_API_KEY,
                    'Content-Type': fileType === 'RBXLX' ? 'application/xml' : 'application/octet-stream'
                }
            });
            return response.data;
        case 'get':
            // Get place info
            const { placeId: getPlaceId } = parameters;
            if (!getPlaceId)
                throw new Error('placeId parameter is required');
            const getUrl = `${baseUrl}/${getPlaceId}`;
            const getResponse = await axios.get(getUrl, {
                headers: {
                    'x-api-key': OPENCLOUD_API_KEY
                }
            });
            return getResponse.data;
        default:
            throw new Error(`Unsupported action type for PlacePublishing: ${actionType}`);
    }
}
/**
 * Handle GameConfig API actions
 */
async function handleGameConfigAction(actionType, universeId, parameters) {
    const baseUrl = `${OPENCLOUD_API_BASE_URL}/v2/universes/${universeId}/configuration`;
    switch (actionType) {
        case 'get':
            // Get game configuration
            const url = baseUrl;
            const response = await axios.get(url, {
                headers: {
                    'x-api-key': OPENCLOUD_API_KEY
                }
            });
            return response.data;
        case 'update':
            // Update game configuration
            const { configuration } = parameters;
            if (!configuration)
                throw new Error('configuration parameter is required');
            const updateResponse = await axios.patch(baseUrl, configuration, {
                headers: {
                    'x-api-key': OPENCLOUD_API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            return updateResponse.data;
        default:
            throw new Error(`Unsupported action type for GameConfig: ${actionType}`);
    }
}
/**
 * Handle PlayerModeration API actions
 */
async function handlePlayerModerationAction(actionType, universeId, parameters) {
    const baseUrl = `${OPENCLOUD_API_BASE_URL}/v1/universes/${universeId}/moderation`;
    switch (actionType) {
        case 'moderate':
            // Moderate a player
            const { userId, action, duration, note } = parameters;
            if (!userId)
                throw new Error('userId parameter is required');
            if (!action)
                throw new Error('action parameter is required (ban, unban, kick, mute, unmute)');
            let url = `${baseUrl}/players/${userId}`;
            let method = 'POST';
            let data = { note };
            switch (action.toLowerCase()) {
                case 'ban':
                    url += '/ban';
                    if (duration)
                        data.duration = duration;
                    break;
                case 'unban':
                    url += '/ban';
                    method = 'DELETE';
                    break;
                case 'kick':
                    url += '/kick';
                    break;
                case 'mute':
                    url += '/mute';
                    if (duration)
                        data.duration = duration;
                    break;
                case 'unmute':
                    url += '/mute';
                    method = 'DELETE';
                    break;
                default:
                    throw new Error(`Unknown moderation action: ${action}`);
            }
            const response = method === 'DELETE'
                ? await axios.delete(url, {
                    headers: {
                        'x-api-key': OPENCLOUD_API_KEY
                    }
                })
                : await axios.post(url, data, {
                    headers: {
                        'x-api-key': OPENCLOUD_API_KEY,
                        'Content-Type': 'application/json'
                    }
                });
            return {
                success: true,
                action: action,
                userId: userId,
                status: response.status,
                message: `Player moderation action '${action}' completed successfully`
            };
        case 'get':
            // Get player moderation status
            const { userId: getStatusUserId } = parameters;
            if (!getStatusUserId)
                throw new Error('userId parameter is required');
            const getUrl = `${baseUrl}/players/${getStatusUserId}/status`;
            const getResponse = await axios.get(getUrl, {
                headers: {
                    'x-api-key': OPENCLOUD_API_KEY
                }
            });
            return getResponse.data;
        default:
            throw new Error(`Unsupported action type for PlayerModeration: ${actionType}`);
    }
}
/**
 * Handle Analytics API actions
 */
async function handleAnalyticsAction(actionType, universeId, parameters) {
    const baseUrl = `${OPENCLOUD_API_BASE_URL}/v1/universes/${universeId}/analytics`;
    switch (actionType) {
        case 'query':
            // Query analytics data
            const { metric, timeFrame, placeId, segmentation } = parameters;
            if (!metric)
                throw new Error('metric parameter is required');
            if (!timeFrame)
                throw new Error('timeFrame parameter is required');
            let url = `${baseUrl}/metrics/${metric}?timeFrame=${timeFrame}`;
            if (placeId)
                url += `&placeId=${placeId}`;
            if (segmentation)
                url += `&segmentation=${segmentation}`;
            const response = await axios.get(url, {
                headers: {
                    'x-api-key': OPENCLOUD_API_KEY
                }
            });
            return response.data;
        default:
            throw new Error(`Unsupported action type for Analytics: ${actionType}`);
    }
}
/**
 * Handle PlaceManagement API actions
 */
async function handlePlaceManagementAction(actionType, universeId, parameters) {
    const baseUrl = `${OPENCLOUD_API_BASE_URL}/v2/universes/${universeId}/places`;
    switch (actionType) {
        case 'list':
            // List all places in the universe
            const response = await axios.get(baseUrl, {
                headers: {
                    'x-api-key': OPENCLOUD_API_KEY
                }
            });
            return response.data;
        case 'create':
            // Create a new place
            const { name, description, fileData, fileType = 'RBXLX' } = parameters;
            if (!name)
                throw new Error('name parameter is required');
            const createData = {
                name: name,
                description: description || ''
            };
            const createResponse = await axios.post(baseUrl, createData, {
                headers: {
                    'x-api-key': OPENCLOUD_API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            // If fileData is provided, publish the initial version
            if (fileData && createResponse.data.id) {
                const placeId = createResponse.data.id;
                await handlePlacePublishingAction('publish', universeId, {
                    placeId,
                    fileData,
                    fileType
                });
            }
            return createResponse.data;
        case 'update':
            // Update place details
            const { placeId: updatePlaceId, name: updateName, description: updateDescription } = parameters;
            if (!updatePlaceId)
                throw new Error('placeId parameter is required');
            const updateData = {};
            if (updateName)
                updateData.name = updateName;
            if (updateDescription)
                updateData.description = updateDescription;
            const updateUrl = `${baseUrl}/${updatePlaceId}`;
            const updateResponse = await axios.patch(updateUrl, updateData, {
                headers: {
                    'x-api-key': OPENCLOUD_API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            return updateResponse.data;
        case 'delete':
            // Delete a place
            const { placeId: deletePlaceId } = parameters;
            if (!deletePlaceId)
                throw new Error('placeId parameter is required');
            const deleteUrl = `${baseUrl}/${deletePlaceId}`;
            const deleteResponse = await axios.delete(deleteUrl, {
                headers: {
                    'x-api-key': OPENCLOUD_API_KEY
                }
            });
            return {
                success: true,
                status: deleteResponse.status,
                message: 'Place deleted successfully'
            };
        default:
            throw new Error(`Unsupported action type for PlaceManagement: ${actionType}`);
    }
}
//# sourceMappingURL=openCloudConnector.js.map