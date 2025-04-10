# Roblex Studio MCP Server

A lightweight Model Context Protocol (MCP) server implementation for Roblex Studio, providing integration with Claude Desktop and other AI assistants that support the MCP protocol.

## Overview

This server implements the Model Context Protocol (MCP) to enable AI assistants to access specialized tools and resources for Roblex Studio development. It establishes a bridge between AI assistants like Claude Desktop and the Roblex Studio environment.

## Features

- **MCP Protocol Implementation**: Full implementation of the core MCP protocol
- **Server-Sent Events (SSE)**: Real-time communication between AI assistants and Roblex Studio
- **Tool Registration System**: Easy registration of tools for AI assistant use
- **Authentication**: Secure API access with API key verification
- **Custom SDK**: Built-in SDK implementation for MCP protocol

## Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/roblex-studio-mcp-server.git
   cd roblex-studio-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create an environment file:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file and set your configuration values.

5. Build the project:
   ```bash
   npm run build
   ```

## Configuration

The server is configured using environment variables in the `.env` file:

### Server Configuration
- `PORT`: Server port (default: 3333)
- `SERVER_NAME`: Name of the MCP server
- `SERVER_VERSION`: Server version
- `REQUIRE_AUTH`: Whether authentication is required (true/false)
- `NODE_ENV`: Environment (development/production)

### Authentication
- `MCP_API_KEY_ROBLEX_STUDIO`: API key for authentication
- `ADMIN_PASSWORD`: Password for admin access
- `SESSION_TIMEOUT`: Session timeout in seconds

### CORS and Logging
- `CORS_ORIGINS`: Allowed origins for CORS
- `LOG_LEVEL`: Logging level (info/debug/warn/error)

## Running the Server

Start the server with:

```bash
npm start
```

For development with hot reloading:

```bash
npm run dev
```

## Using with Claude Desktop

1. Configure Claude Desktop to use this MCP server:
   - Open Claude Desktop settings
   - Add a new MCP server with URL: `http://localhost:3333`
   - Save the configuration

2. In Claude Desktop, you can now access the Roblex Studio tools

## Endpoints

- `/sse`: SSE connection endpoint for real-time communication
- `/messages`: Message handling endpoint for tool invocation
- `/studio/status`: Status information about Studio connections
- `/auth/login`: Authentication endpoint
- `/auth/logout`: Logout endpoint

## Project Structure

```
roblex-studio-mcp-server/
├── src/               # Source code
│   ├── index.ts       # Main entry point
│   ├── tools/         # MCP tools implementations
│   ├── resources/     # MCP resources
│   ├── prompts/       # MCP prompts
│   ├── models/        # Data models
│   ├── sdk/           # MCP SDK implementation
│   ├── server/        # Server implementation
│   │   ├── index.ts   # Server exports
│   │   ├── McpServer.ts   # MCP server implementation
│   │   └── SSEServerTransport.ts # SSE transport
│   ├── types/         # Type definitions
│   └── utils/         # Utilities
├── dist/              # Compiled output
├── package.json       # Project metadata and dependencies
├── tsconfig.json      # TypeScript configuration
├── .env.example       # Example environment variables
└── .env               # Environment variables (create from example)
```

## Adding New Tools

1. Create a new tool file in the `src/tools` directory
2. Implement the tool following the MCP protocol
3. Register the tool in `src/tools/index.ts`
4. Rebuild the project

Example tool implementation:

```typescript
// src/tools/myNewTool.ts
import { logger } from '../utils/logger';

export function registerMyNewTool(server: any) {
  server.tool(
    'my-new-tool',
    {
      type: 'object',
      properties: {
        param1: { type: 'string' },
        param2: { type: 'number' }
      },
      required: ['param1']
    },
    async (parameters: any) => {
      logger.info(`Executing my-new-tool with ${parameters.param1}`);
      // Tool implementation logic here
      return { result: 'Success', data: 'Tool response' };
    }
  );
}
```

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.