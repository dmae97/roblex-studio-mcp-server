import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.js';
/**
 * Documentation resources for Roblex Studio
 */
export const documentation = {
    register: (server) => {
        // Register API docs resource
        server.resource('api-docs', new ResourceTemplate('docs://api/{section}', { list: 'docs://api' }), async (uri, { section }) => {
            logger.info(`Fetching API documentation for section: ${section}`);
            try {
                // In a real implementation, this would fetch documentation from a database or file system
                // For now, we'll return mock documentation based on the requested section
                let content = '';
                switch (section) {
                    case 'overview':
                        content = `# Roblex Studio API Overview
              
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

- ` / assets ` - Manage Roblex assets
- ` / scripts ` - Manage Lua scripts
- ` / experiences ` - Manage Roblex experiences
- ` / users ` - User management
- ` / analytics ` - Analytics and reporting
              `;
                        break;
                    case 'assets':
                        content = `# Roblex Studio Assets API
              
This section covers the endpoints for managing Roblex assets.

## List Assets

\`GET /assets\`

Returns a list of assets in your Roblex Studio account.

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Filter by asset type (Model, Decal, etc.) |
| q | string | Search query |
| limit | integer | Number of results to return (default: 50, max: 100) |
| offset | integer | Pagination offset |

### Example Response

\`\`\`json
{
  "success": true,
  "data": {
    "assets": [
      {
        "id": "12345",
        "name": "Example Asset",
        "type": "Model",
        "created_at": "2024-03-15T12:00:00Z",
        "updated_at": "2024-03-16T15:30:00Z"
      }
    ],
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
\`\`\`

## Get Asset

\`GET /assets/{asset_id}\`

Returns details for a specific asset.

### Example Response

\`\`\`json
{
  "success": true,
  "data": {
    "id": "12345",
    "name": "Example Asset",
    "type": "Model",
    "created_at": "2024-03-15T12:00:00Z",
    "updated_at": "2024-03-16T15:30:00Z",
    "description": "An example asset",
    "creator_id": "user_789",
    "size": 1024,
    "download_url": "https://cdn.roblexstudio.com/assets/12345.rbxm"
  }
}
\`\`\`

## Upload Asset

\`POST /assets\`

Uploads a new asset to Roblex Studio.

### Request Body

Form data with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| file | file | The asset file to upload |
| name | string | Asset name |
| description | string | Asset description |
| type | string | Asset type |

### Example Response

\`\`\`json
{
  "success": true,
  "data": {
    "id": "12346",
    "name": "New Asset",
    "type": "Model",
    "created_at": "2024-04-01T10:00:00Z",
    "updated_at": "2024-04-01T10:00:00Z"
  }
}
\`\`\`
              `;
                        break;
                    case 'scripts':
                        content = `# Roblex Studio Scripts API
              
This section covers the endpoints for managing Lua scripts in Roblex Studio.

## List Scripts

\`GET /scripts\`

Returns a list of scripts in your Roblex Studio account.

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Filter by script type (ServerScript, LocalScript, ModuleScript) |
| q | string | Search query |
| limit | integer | Number of results to return (default: 50, max: 100) |
| offset | integer | Pagination offset |

### Example Response

\`\`\`json
{
  "success": true,
  "data": {
    "scripts": [
      {
        "id": "script_12345",
        "name": "Example Script",
        "type": "ServerScript",
        "created_at": "2024-03-15T12:00:00Z",
        "updated_at": "2024-03-16T15:30:00Z"
      }
    ],
    "total": 75,
    "limit": 50,
    "offset": 0
  }
}
\`\`\`

## Get Script

\`GET /scripts/{script_id}\`

Returns details and content for a specific script.

### Example Response

\`\`\`json
{
  "success": true,
  "data": {
    "id": "script_12345",
    "name": "Example Script",
    "type": "ServerScript",
    "created_at": "2024-03-15T12:00:00Z",
    "updated_at": "2024-03-16T15:30:00Z",
    "content": "print('Hello, Roblex!')",
    "creator_id": "user_789",
    "size": 256,
    "parent_id": "model_456"
  }
}
\`\`\`

## Create Script

\`POST /scripts\`

Creates a new script in Roblex Studio.

### Request Body

\`\`\`json
{
  "name": "New Script",
  "type": "LocalScript",
  "content": "print('Hello from a new script!')",
  "parent_id": "model_456"
}
\`\`\`

### Example Response

\`\`\`json
{
  "success": true,
  "data": {
    "id": "script_12346",
    "name": "New Script",
    "type": "LocalScript",
    "created_at": "2024-04-01T10:00:00Z",
    "updated_at": "2024-04-01T10:00:00Z"
  }
}
\`\`\`

## Update Script

\`PUT /scripts/{script_id}\`

Updates an existing script.

### Request Body

\`\`\`json
{
  "name": "Updated Script Name",
  "content": "print('Updated content!')"
}
\`\`\`

### Example Response

\`\`\`json
{
  "success": true,
  "data": {
    "id": "script_12345",
    "name": "Updated Script Name",
    "type": "ServerScript",
    "created_at": "2024-03-15T12:00:00Z",
    "updated_at": "2024-04-01T11:30:00Z"
  }
}
\`\`\`

## Validate Script

\`POST /scripts/validate\`

Validates a Lua script without creating it.

### Request Body

\`\`\`json
{
  "content": "local function test() print('Test') end",
  "type": "ModuleScript"
}
\`\`\`

### Example Response

\`\`\`json
{
  "success": true,
  "data": {
    "valid": true,
    "issues": []
  }
}
\`\`\`
              `;
                        break;
                    default:
                        content = `# Roblex Studio Documentation
              
This documentation covers the Roblex Studio API and features.

## Available Sections

- [API Overview](docs://api/overview)
- [Assets API](docs://api/assets)
- [Scripts API](docs://api/scripts)
- [Experiences API](docs://api/experiences)
- [Users API](docs://api/users)
- [Analytics API](docs://api/analytics)

For more detailed information, please visit the [official Roblex Studio documentation](https://docs.roblexstudio.com).
              `;
                }
                return {
                    contents: [
                        {
                            uri: uri.href,
                            text: content
                        }
                    ]
                };
            }
            catch (error) {
                logger.error(`Error fetching documentation for section ${section}:`, error);
                return {
                    contents: [
                        {
                            uri: uri.href,
                            text: `Error fetching documentation: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ]
                };
            }
        });
        // Register complete docs listing
        server.resource('api-docs-list', 'docs://api', async (uri) => {
            logger.info('Fetching API documentation listing');
            try {
                // Return a listing of all available documentation sections
                return {
                    contents: [
                        {
                            uri: uri.href,
                            text: JSON.stringify({
                                sections: [
                                    {
                                        id: 'overview',
                                        title: 'API Overview',
                                        uri: 'docs://api/overview'
                                    },
                                    {
                                        id: 'assets',
                                        title: 'Assets API',
                                        uri: 'docs://api/assets'
                                    },
                                    {
                                        id: 'scripts',
                                        title: 'Scripts API',
                                        uri: 'docs://api/scripts'
                                    },
                                    {
                                        id: 'experiences',
                                        title: 'Experiences API',
                                        uri: 'docs://api/experiences'
                                    },
                                    {
                                        id: 'users',
                                        title: 'Users API',
                                        uri: 'docs://api/users'
                                    },
                                    {
                                        id: 'analytics',
                                        title: 'Analytics API',
                                        uri: 'docs://api/analytics'
                                    }
                                ]
                            }, null, 2)
                        }
                    ]
                };
            }
            catch (error) {
                logger.error('Error fetching documentation listing:', error);
                return {
                    contents: [
                        {
                            uri: uri.href,
                            text: `Error fetching documentation listing: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ]
                };
            }
        });
        logger.debug('Documentation resources registered');
    }
};
//# sourceMappingURL=documentation.js.map