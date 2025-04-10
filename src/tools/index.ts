import { codeGenerator } from './codeGenerator';

/**
 * Collection of Roblex Studio tools for MCP Server
 */
export const roblexTools = {
    register: (server: any) => {
        // Register all tools
        codeGenerator.register(server);
    }
}; 