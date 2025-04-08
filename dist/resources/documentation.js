"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentation = void 0;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const logger_js_1 = require("../utils/logger.js");
/**
 * Documentation resources for Roblex Studio
 */
exports.documentation = {
    register: (server) => {
        // Create resource template for API documentation
        try {
            // Define documentation sections
            const sections = [
                { uri: 'docs://api/overview', name: 'API Overview', description: 'General API information' },
                { uri: 'docs://api/assets', name: 'Assets API', description: 'Manage Roblex assets' },
                { uri: 'docs://api/scripts', name: 'Scripts API', description: 'Manage Lua scripts' },
                { uri: 'docs://api/experiences', name: 'Experiences API', description: 'Manage Roblex experiences' },
                { uri: 'docs://api/users', name: 'Users API', description: 'User management' },
                { uri: 'docs://api/analytics', name: 'Analytics API', description: 'Analytics and reporting' }
            ];
            // Create template with type assertion
            server.resource('api-docs', new mcp_js_1.ResourceTemplate('docs://api/{section}', {
                list: async () => {
                    try {
                        logger_js_1.logger.info('Listing API documentation resources');
                        return {
                            resources: sections.map(section => ({
                                uri: section.uri,
                                name: section.name,
                                description: section.description
                            }))
                        };
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        logger_js_1.logger.error(`Error fetching documentation listing: ${errorMessage}`);
                        return {
                            resources: [],
                            error: {
                                code: 'ListError',
                                message: 'Failed to fetch documentation list'
                            }
                        };
                    }
                }
            }), 
            // Resource read callback
            async (uri, variables) => {
                try {
                    // Handle section parameter
                    if (!variables || !variables.section) {
                        logger_js_1.logger.error('Missing section variable in request');
                        return {
                            contents: [],
                            error: {
                                code: 'InvalidParams',
                                message: 'Missing section variable'
                            }
                        };
                    }
                    const section = Array.isArray(variables.section)
                        ? variables.section[0] // Use first element if array
                        : variables.section; // Use as is if string
                    if (Array.isArray(variables.section)) {
                        logger_js_1.logger.warn(`Section variable is an array, using first element: ${section}`);
                    }
                    logger_js_1.logger.info(`Fetching API documentation for section: ${section}`);
                    // Generate documentation content based on section
                    let content = '';
                    switch (section) {
                        case 'overview':
                            content = `## Roblex Studio API Overview

The Roblex Studio API provides programmatic access to Roblex Studio features and functionality. 
This allows developers to create, modify, and manage Roblex experiences through code.

## Base URL

All API requests should be made to: \`https://api.roblexstudio.com/v1/\`

## Authentication

Authentication is required for all API endpoints. Use your API key as a bearer token:

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Rate Limits

Rate limits are applied on a per-key basis:
- 100 requests per minute
- 5,000 requests per day

## Response Format

All responses are returned in JSON format with a standard structure:
\`\`\`json
{
  "success": true,
  "data": {
    // Response data here
  }
}
\`\`\`

Or for errors:
\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
\`\`\`

## Available Endpoints

- \`/assets\` - Manage Roblex assets
- \`/scripts\` - Manage Lua scripts
- \`/experiences\` - Manage Roblex experiences
- \`/users\` - User management
- \`/analytics\` - Analytics and reporting
`;
                            break;
                        case 'assets':
                            content = `## Roblex Studio Assets API

This section covers the endpoints for managing Roblex assets.`;
                            break;
                        case 'scripts':
                            content = `## Roblex Studio Scripts API

This section covers the endpoints for managing Lua scripts in Roblex Studio.`;
                            break;
                        case 'experiences':
                            content = `## Roblex Studio Experiences API

This section covers the endpoints for managing Roblex experiences.`;
                            break;
                        case 'users':
                            content = `## Roblex Studio Users API

This section covers the endpoints for managing Roblex users.`;
                            break;
                        case 'analytics':
                            content = `## Roblex Studio Analytics API

This section covers the endpoints for analytics and reporting.`;
                            break;
                        default:
                            return {
                                contents: [],
                                error: {
                                    code: 'ResourceNotFound',
                                    message: `Documentation section not found: ${section}`
                                }
                            };
                    }
                    // Return content
                    return {
                        contents: [{
                                uri: uri.toString(),
                                text: content,
                                mimeType: 'text/markdown'
                            }]
                    };
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    logger_js_1.logger.error(`Error fetching documentation: ${errorMessage}`);
                    return {
                        contents: [],
                        error: {
                            code: 'InternalError',
                            message: `Internal server error: ${errorMessage}`
                        }
                    };
                }
            });
            logger_js_1.logger.debug('Documentation resources registered');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger_js_1.logger.error(`Failed to register documentation resources: ${errorMessage}`);
        }
    }
};
//# sourceMappingURL=documentation.js.map