# Roblox Studio MCP Server

A Model Context Protocol (MCP) server implementation for Roblox Studio, built with TypeScript.

## Overview

This MCP server provides resources, tools, and prompts specifically designed for Roblox Studio development. It enables LLM applications to access Roblox Studio documentation, templates, code generation capabilities, and other features through a standardized interface.

## Features

- **Resources**: Access Roblox Studio documentation, API references, and code templates
- **Tools**: Generate and validate Luau code, find assets, and create game components
- **Prompts**: Use specialized prompts for script generation, bug finding, and performance optimization
- **API Integration**: Connect directly to the Roblox API and Open Cloud API
- **Interactive Systems**: Create dialogue systems, UI interfaces, and complex gameplay mechanics

## Prerequisites

- Node.js >= 18.x
- npm or yarn
- Roblox API key (for API integration features)
- Roblox Open Cloud API key (for Open Cloud features)

## Installation

1. Clone the repository
```bash
git clone https://github.com/dmae97/roblox-studio-mcp-server.git
cd roblox-studio-mcp-server
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file based on `.env.example`
```bash
cp .env.example .env
```

4. Update the `.env` file with your Roblox API key and other configurations
```
ROBLOX_API_KEY=your_api_key_here
ROBLOX_OPEN_CLOUD_API_KEY=your_open_cloud_api_key_here
ROBLOX_OPEN_CLOUD_UNIVERSE_ID=your_universe_id_here
```

5. Build the project
```bash
npm run build
```

## Running the Server

Start the server in development mode:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

The server will start on port 3000 by default (configurable in `.env`).

## API Endpoints

- `GET /sse` - Server-Sent Events endpoint for MCP communication
- `POST /messages` - Message endpoint for MCP communication
- `GET /health` - Health check endpoint
- `GET /metrics` - Server metrics endpoint (when enabled)

## Resources

### Documentation

- `docs://api/{section}` - Access Roblox Studio API documentation
- `docs://api` - List available documentation sections
- `docs://luau` - Luau language documentation and best practices
- `docs://services/{service}` - Documentation for specific Roblox services

### Templates

- `template://roblox/{category}/{name}` - Access code templates
- `template://roblox` - List available templates
- `template://ui/{component}` - UI component templates using Roblox UI

## Tools

### Code Generator

The `generate-roblox-code` tool generates Roblox Luau code based on user specifications.

Parameters:
- `scriptType`: Type of script to generate (ServerScript, LocalScript, ModuleScript)
- `functionality`: Description of what the script should do
- `includeComments`: Whether to include comments in the code
- `targetRobloxVersion`: (Optional) Target Roblox version

### Asset Finder

The `find-roblox-assets` tool finds Roblox assets based on user criteria.

Parameters:
- `assetType`: Type of asset to find (Model, Decal, Mesh, Animation, Sound, Texture)
- `keywords`: Search keywords or tags
- `maxResults`: Maximum number of results to return
- `includeDetails`: Whether to include detailed asset information

### Script Validator

The `validate-roblox-script` tool validates Luau scripts for syntax errors and best practices.

Parameters:
- `scriptContent`: The Luau script content to validate
- `scriptType`: Type of script (ServerScript, LocalScript, ModuleScript)
- `checkBestPractices`: Whether to check for best practices
- `checkPerformance`: Whether to check for performance issues

### New Tools

#### Data Store Manager

The `create-datastore-system` tool generates complete DataStore code for persistent data management.

Parameters:
- `datastoreName`: Name of the DataStore
- `dataStructure`: Structure of the data to be stored
- `sessionCaching`: Whether to include session caching logic
- `backupStrategy`: Data backup strategy
- `playerData`: Whether this is for player data

#### Physics System Generator

The `create-physics-system` tool generates physics-based systems for Roblox.

Parameters:
- `objectName`: Name of the physical object
- `objectType`: Type of physical object
- `size`: Size dimensions
- `material`: Material type
- `physicsProperties`: Density, friction, etc.
- `constraints`: Optional physical constraints

#### UI Builder

The `create-ui-system` tool generates Roblox UI code.

Parameters:
- `uiType`: Type of UI (Menu, HUD, Dialog, Inventory)
- `elements`: UI elements to include
- `responsive`: Whether the UI should be responsive
- `stylePreset`: Visual style preset to use

### Roblox API Connectors

Tools for directly connecting to the Roblox API:

#### Search Assets API

The `roblox-search-assets` tool searches for assets using the official Roblox API.

#### Open Cloud Integration

The `roblox-open-cloud` tool provides access to Roblox Open Cloud API features.

Parameters:
- `feature`: Open Cloud feature to use
- `universeId`: Universe ID to operate on
- `actionType`: Type of action to perform
- `data`: Data for the action

## Prompts

### Script Generator

The `generate-script` prompt helps generate Roblox scripts with AI assistance.

Parameters:
- `scriptType`: Type of script to generate
- `functionality`: Description of what the script should do
- `includeComments`: Whether to include comments in the code
- `complexity`: Complexity level (Beginner, Intermediate, Advanced)
- `targetAudience`: Target audience (Child, Teen, Adult)

### Bug Finder

The `find-bugs` prompt analyzes scripts for bugs and suggests improvements.

Parameters:
- `scriptContent`: The Luau script content to analyze
- `scriptType`: Type of script
- `checkPerformance`: Whether to check for performance issues
- `checkSecurity`: Whether to check for security issues
- `suggestImprovements`: Whether to suggest improvements

### Performance Optimizer

The `optimize-performance` prompt analyzes and optimizes Roblox scripts for better performance.

Parameters:
- `scriptContent`: The script to optimize
- `targetFPS`: Target frames per second
- `optimizationLevel`: Level of optimization to apply
- `preserveReadability`: Whether to prioritize readability

## Development

### Project Structure

- `src/index.ts` - Main server file
- `src/utils/` - Utility functions
- `src/tools/` - MCP tools implementation
- `src/resources/` - MCP resources implementation
- `src/prompts/` - MCP prompts implementation
- `src/api/` - Roblox API client implementation
- `src/tools/interactive/` - Interactive systems and UI tools
- `src/tools/physics/` - Physics system tools
- `src/tools/datastore/` - DataStore management tools
- `src/tools/opencloud/` - Open Cloud API integration

### MCP Integration Examples

Here are examples of how to use this MCP server with various LLM applications:

#### Example 1: Using the API with Claude

```javascript
// Example code for calling the MCP server from a web application using Claude
async function callRobloxMcp() {
  const response = await fetch('https://your-claude-api-endpoint/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-claude-api-key'
    },
    body: JSON.stringify({
      model: "claude-3.7-sonnet-20250219",
      messages: [
        {
          role: "user",
          content: "Can you help me create a platformer game in Roblox Studio?"
        }
      ],
      tool_choice: "auto",
      tools: [
        {
          function: {
            name: "mcp",
            description: "Call the Roblox Studio MCP server",
            parameters: {
              type: "object",
              properties: {
                server_url: {
                  type: "string",
                  description: "URL of the MCP server"
                },
                tool_name: {
                  type: "string",
                  description: "Name of the MCP tool to call"
                },
                tool_parameters: {
                  type: "object",
                  description: "Parameters for the MCP tool"
                }
              },
              required: ["server_url", "tool_name"]
            }
          }
        }
      ]
    })
  });
  
  return await response.json();
}
```

#### Example 2: Using MCP Server as a CLI Tool

You can also use the MCP server through command-line:

```bash
# Install MCP client CLI
npm install -g @modelcontextprotocol/cli

# Connect to your MCP server
mcp connect http://localhost:3000

# Use MCP tools
mcp tool generate-roblox-code --scriptType=ServerScript --functionality="Handle player movement" --includeComments=true

# Access templates
mcp resource template://roblox/game/platformer
```

#### Example 3: Connecting with Anthropic's Claude

```python
import anthropic
from anthropic.tool_use import MCP

# Initialize Claude client
client = anthropic.Client(api_key="your-anthropic-api-key")

# Create MCP connection
mcp = MCP(server_url="http://localhost:3000")

# Send message to Claude with MCP capabilities
response = client.messages.create(
    model="claude-3.7-sonnet-20250219",
    max_tokens=1000,
    system="You are a helpful AI assistant with access to Roblox Studio MCP server.",
    messages=[
        {
            "role": "user",
            "content": "I want to create a multiplayer game in Roblox Studio. What tools should I use?"
        }
    ],
    tools=[mcp.to_tool()]
)

print(response.content)
```

### Scripts

- `npm run build` - Build the project
- `npm run dev` - Run in development mode with hot reload
- `npm start` - Run the production server
- `npm run lint` - Run linting
- `npm test` - Run tests

## Recent Updates

- Added Open Cloud API integration
- Enhanced physics system tools
- Added UI component templates
- Improved error handling and logging
- Added caching for better performance
- Updated to latest Roblox API endpoints

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
