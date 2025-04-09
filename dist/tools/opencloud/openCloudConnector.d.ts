import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Toolset for interacting with Roblox Open Cloud APIs.
 */
declare const openCloudConnector: {
    apiKey: string;
    baseUrl: string;
    _makeRequest(method: 'get' | 'post', path: string, data?: any): Promise<any>;
    register: (server: McpServer) => void;
};
export { openCloudConnector };
