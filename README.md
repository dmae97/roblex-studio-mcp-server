# Roblex Studio MCP Server

A Model Context Protocol (MCP) server implementation for Roblex Studio, built with TypeScript.

## Overview

This MCP server provides resources, tools, and prompts specifically designed for Roblex Studio development. It enables LLM applications to access Roblex Studio documentation, templates, code generation capabilities, and other features through a standardized interface.

## Features

- **Resources**: Access Roblex Studio documentation and code templates
- **Tools**: Generate and validate Roblex code, find assets, and more
- **Prompts**: Use specialized prompts for script generation and bug finding
- **API Integration**: Connect directly to the Roblex Studio API

## Prerequisites

- Node.js >= 18.x
- npm or yarn
- Roblex Studio API key (for API integration features)

## Installation

1. Clone the repository
```bash
git clone https://github.com/dmae97/roblex-studio-mcp-server.git
cd roblex-studio-mcp-server
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file based on `.env.example`
```bash
cp .env.example .env
```

4. Update the `.env` file with your Roblex Studio API key
```
ROBLEX_API_KEY=your_api_key_here
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

## Resources

### Documentation

- `docs://api/{section}` - Access Roblex Studio API documentation
- `docs://api` - List available documentation sections

### Templates

- `template://roblex/{category}/{name}` - Access code templates
- `template://roblex` - List available templates

## Tools

### Code Generator

The `generate-roblex-code` tool generates Roblex code based on user specifications.

Parameters:
- `scriptType`: Type of script to generate (ServerScript, LocalScript, ModuleScript)
- `functionality`: Description of what the script should do
- `includeComments`: Whether to include comments in the code
- `targetRoblexVersion`: (Optional) Target Roblex version

### Asset Finder

The `find-roblex-assets` tool finds Roblex assets based on user criteria.

Parameters:
- `assetType`: Type of asset to find (Model, Decal, Mesh, Animation, Sound, Texture)
- `keywords`: Search keywords or tags
- `maxResults`: Maximum number of results to return
- `includeDetails`: Whether to include detailed asset information

### Script Validator

The `validate-roblex-script` tool validates Roblex scripts for syntax errors and best practices.

Parameters:
- `scriptContent`: The Lua script content to validate
- `scriptType`: Type of script (ServerScript, LocalScript, ModuleScript)
- `checkBestPractices`: Whether to check for best practices
- `checkPerformance`: Whether to check for performance issues

### Roblex API Connector

Tools for directly connecting to the Roblex Studio API:

#### Search Assets API

The `roblex-search-assets` tool searches for assets using the official Roblex API.

Parameters:
- `query`: Search query
- `assetType`: (Optional) Type of asset to search for
- `limit`: Maximum number of results (default: 10, max: 100)
- `offset`: Pagination offset (default: 0)

#### Validate Script API

The `roblex-validate-script` tool validates scripts using the official Roblex API.

Parameters:
- `scriptContent`: The Lua script content to validate
- `scriptType`: Type of script

#### Create Script API

The `roblex-create-script` tool creates a script using the official Roblex API.

Parameters:
- `name`: Name of the script
- `type`: Type of script
- `content`: Script content
- `parentId`: (Optional) ID of the parent object

#### Get Asset API

The `roblex-get-asset` tool gets asset information using the official Roblex API.

Parameters:
- `assetId`: ID of the asset to get

#### Get User Profile API

The `roblex-get-user-profile` tool gets user profile information using the official Roblex API.

Parameters:
- `userId`: ID of the user

## Prompts

### Script Generator

The `generate-script` prompt helps generate Roblex scripts with AI assistance.

Parameters:
- `scriptType`: Type of script to generate
- `functionality`: Description of what the script should do
- `includeComments`: Whether to include comments in the code
- `complexity`: Complexity level (Beginner, Intermediate, Advanced)
- `targetAudience`: Target audience (Child, Teen, Adult)

### Bug Finder

The `find-bugs` prompt analyzes scripts for bugs and suggests improvements.

Parameters:
- `scriptContent`: The Lua script content to analyze
- `scriptType`: Type of script
- `checkPerformance`: Whether to check for performance issues
- `checkSecurity`: Whether to check for security issues
- `suggestImprovements`: Whether to suggest improvements

## Development

### Project Structure

- `src/index.ts` - Main server file
- `src/utils/` - Utility functions
- `src/tools/` - MCP tools implementation
- `src/resources/` - MCP resources implementation
- `src/prompts/` - MCP prompts implementation
- `src/api/` - Roblex API client implementation

### Scripts

- `npm run build` - Build the project
- `npm run dev` - Run in development mode with hot reload
- `npm start` - Run the production server
- `npm run lint` - Run linting
- `npm test` - Run tests

## License

MIT
