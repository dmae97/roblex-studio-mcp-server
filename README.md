# Roblox Studio MCP Server

A Model-Context-Protocol (MCP) server implementation for Roblox Studio with enhanced Sequential MCP execution support and Claude Desktop integration.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Sequential MCP](#sequential-mcp)
  - [Priority Queue](#priority-queue)
  - [Queue Management](#queue-management)
  - [Concurrency Control](#concurrency-control)
- [Claude Desktop Integration](#claude-desktop-integration)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview

Roblox Studio MCP Server enhances your Roblox game development workflow by enabling bidirectional communication with external systems. Automate scripting, UI manipulation, game management, and more with reliable sequential execution of operations.

**Use cases:**
- AI-powered code generation and editing
- Integration with external editors for advanced coding
- Real-time game data monitoring and manipulation
- Workflow automation for game development
- Sequential execution of interdependent operations
- Claude Desktop AI integration for advanced assistance

## Features

- **Enhanced Sequential MCP**: Advanced implementation of sequential tool execution
  - Priority queue system for important operations
  - Queue statistics and monitoring
  - Dynamic concurrency control
  - Error resilience and recovery
- **Standard MCP Server**: Traditional MCP server implementation for handling tool calls
- **Server-Sent Events (SSE) Transport**: Real-time communication between clients and server
- **Roblox Studio Integration**: Specialized tools and models for Roblox Studio
- **Claude Desktop Integration**: Connect Claude Desktop to enhance your workflow
- **Authentication**: API key and session-based authentication
- **Extensible Architecture**: Easy to add new tools, resources, and models

## Sequential MCP

The enhanced Sequential MCP implementation ensures that tool calls are processed in order, with priority support, statistics tracking, and dynamic concurrency controls.

### Priority Queue

The Priority Queue system allows critical operations to be executed before less important tasks:

- Assign priority levels to tools (higher values = higher priority)
- High-priority tasks are processed first, regardless of when they were added
- Tasks with the same priority are processed in FIFO order
- Priority threshold configuration to distinguish between normal and high-priority tasks

### Queue Management

The Queue Management system provides visibility and control over the task queue:

- Real-time queue statistics (length, active counts, processing times)
- Ability to clear the queue in emergency situations
- Processing time tracking for performance analysis
- Error handling and recovery without blocking the queue

### Concurrency Control

Dynamic Concurrency Control allows adjusting the processing capacity based on server load:

- Configurable number of concurrent tasks (default: 1 for strict ordering)
- Runtime adjustment through API without server restart
- Automatic scaling of processing based on configured concurrency

## Claude Desktop Integration

The server now includes enhanced support for Claude Desktop, enabling advanced AI assistance for your development workflow:

- **Reliable SSE Connections**: Improved Server-Sent Events transport with heartbeat mechanism
- **Automatic Reconnection**: Connection recovery features for robust operation
- **Specialized Endpoints**: Dedicated endpoints for Claude Desktop communication
- **Enhanced Error Handling**: Better error recovery and logging for connection issues
- **Simple Authentication**: Streamlined authentication process for Claude Desktop

### Connecting Claude Desktop

To connect Claude Desktop to your MCP server:

1. Ensure the server is running with Claude Desktop integration enabled (`ENABLE_CLAUDE_DESKTOP=true` in `.env`)
2. In Claude Desktop, point the connection to `http://localhost:3001/claude/connect`
3. For SSE streaming, use the endpoint `http://localhost:3001/sse`
4. For message posting, use `http://localhost:3001/messages?sessionId=YOUR_SESSION_ID`

## Getting Started

### Requirements

- Node.js 18.x or higher
- npm or Yarn
- TypeScript 5.x
- Roblox Studio
- Claude Desktop (optional)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/roblex-studio-mcp-server.git
   cd roblex-studio-mcp-server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Setup environment variables:
   ```
   cp .env.example .env
   ```
   Edit `.env` as needed. Make sure to set `USE_SEQUENTIAL=true` to enable the Sequential MCP features.

4. Build the project:
   ```
   npm run build
   ```

5. Start the server:
   ```
   npm start
   ```

6. Install the Roblox Studio plugin:
   - Copy `src/plugins/RobloxStudioPlugin.lua` into your Roblox Studio plugins folder
   - Enable the plugin inside Roblox Studio

### First Connection

1. Launch Roblox Studio
2. Open the MCP server plugin
3. Set the server URL (default: `http://localhost:3001`)
4. Click **Connect**
5. On success, you will see a connection message in the console
6. Test the Sequential MCP functionality with the test script:
   ```
   npm run test:sequential
   ```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------| 
| `PORT` | Server port | `3001` |
| `LOG_LEVEL` | Logging level (`debug`, `info`, `warn`, `error`) | `info` |
| `API_KEYS` | Comma-separated list of API keys | - |
| `JWT_SECRET` | JWT secret key | - |
| `REQUIRE_AUTH` | Require authentication (`true`/`false`) | `false` |
| `SESSION_TIMEOUT` | Session timeout in seconds | `3600` |
| `USE_SEQUENTIAL` | Use Sequential MCP (`true`/`false`) | `false` |
| `SEQUENTIAL_CONCURRENCY` | Number of concurrent tasks | `1` |
| `PRIORITY_THRESHOLD` | Threshold for high-priority tasks | `5` |
| `ENABLE_CLAUDE_DESKTOP` | Enable Claude Desktop integration | `true` |
| `CLAUDE_HEARTBEAT_INTERVAL` | Interval for SSE heartbeats (ms) | `30000` |
| `CLAUDE_MAX_RECONNECT_ATTEMPTS` | Max reconnection attempts | `5` |

### Config files

- `config/default.json`: default settings
- `config/development.json`: development overrides (`.env` takes precedence)
- `config/production.json`: production overrides

## API Reference

### Claude Desktop API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/claude/connect` | POST | Establish Claude Desktop connection |
| `/ping` | GET | Heartbeat endpoint for connection testing |

### Sequential MCP API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/roblox-studio/queue/stats` | GET | Get queue statistics |
| `/api/roblox-studio/queue/clear` | POST | Clear the task queue |
| `/api/roblox-studio/concurrency` | POST | Update concurrency level |

### Standard API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/sse` | GET | SSE connection endpoint |
| `/messages` | POST | Message handling endpoint |
| `/studio/api` | POST | Direct studio communication |
| `/auth/login` | POST | Authentication endpoint |
| `/auth/logout` | POST | Logout endpoint |

See [docs/ROBLOX-STUDIO-API.md](docs/ROBLOX-STUDIO-API.md) for full API details.

## Examples

### Create a Script with Sequential Processing

```javascript
const eventSource = new EventSource('http://localhost:3001/sse?studioId=myStudio');
let sessionId = '';

eventSource.addEventListener('endpoint', (event) => {
  const data = JSON.parse(event.data);
  sessionId = data.sessionId;

  // First create a script
  fetch(`http://localhost:3001/messages?sessionId=${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'createModel',
      modelType: 'script',
      data: {
        name: 'HelloWorld',
        type: 'LocalScript',
        content: 'print("Hello from MCP Server!")',
        parent: 'StarterPlayerScripts'
      }
    })
  }).then(response => response.json())
    .then(result => {
      // After script creation, update its content
      fetch(`http://localhost:3001/messages?sessionId=${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'updateModel',
          modelName: result.model.name,
          data: {
            content: 'print("Updated content with Sequential MCP!")'
          }
        })
      });
    });
});
```

### Using Claude Desktop for AI-Assisted Development

```javascript
// Establish connection to Claude Desktop
fetch('http://localhost:3001/claude/connect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientName: 'MyDevelopmentTool'
  })
})
.then(response => response.json())
.then(result => {
  const sessionId = result.sessionId;
  
  // Create event source for real-time updates
  const eventSource = new EventSource(`http://localhost:3001/sse?sessionId=${sessionId}`);
  
  // Listen for Claude's responses
  eventSource.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    console.log('Received from Claude:', data);
    
    // Process response from Claude
    if (data.type === 'claude_response') {
      // Use Claude's response in your application
      processClaudeResponse(data.content);
    }
  });
  
  // Send a query to Claude
  function askClaude(query) {
    fetch(`http://localhost:3001/messages?sessionId=${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'claude_query',
        data: { query }
      })
    });
  }
  
  // Example query
  askClaude('Help me design a leaderboard system for my Roblox game');
});
```

### Using Priority Queue for Critical Operations

```javascript
// High-priority operation (will be processed before normal operations)
fetch(`http://localhost:3001/api/roblox-studio/messages/${sessionId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'tool_call',
    data: {
      toolName: 'CriticalOperation',
      priority: 10, // High priority value
      args: {
        // Tool arguments
      }
    }
  })
});
```

### Queue Management

```javascript
// Get queue statistics
fetch(`http://localhost:3001/api/roblox-studio/queue/stats`)
  .then(response => response.json())
  .then(stats => console.log('Queue stats:', stats));

// Clear the queue in emergency situations
fetch(`http://localhost:3001/api/roblox-studio/queue/clear`, {
  method: 'POST'
}).then(response => response.json())
  .then(result => console.log('Queue cleared:', result));

// Update concurrency
fetch(`http://localhost:3001/api/roblox-studio/concurrency`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ concurrency: 2 })
}).then(response => response.json())
  .then(result => console.log('Concurrency updated:', result));
```

More examples can be found in `src/examples` and `test-sequential-mcp.js`.

## Development

### Project Structure

```
roblex-studio-mcp-server/
├── src/
│   ├── index.ts             # Server entry point
│   ├── models/              # Data models
│   │   └── types.ts         # Common interfaces for models
│   ├── server/              # Server implementations
│   │   ├── McpServer.ts     # Base MCP server
│   │   └── SequentialMcpServer.ts # Enhanced Sequential MCP
│   │   └── SSEServerTransport.ts  # SSE transport with Claude support
│   ├── tools/               # MCP tools
│   ├── utils/               # Utilities
│   ├── plugins/             # Roblox Studio plugins
│   └── examples/            # Example code
├── config/                  # Configuration files
├── logs/                    # Log files
├── docs/                    # Documentation
├── test-sequential-mcp.js   # Sequential MCP test script
└── test/                    # Tests
```

### Adding a New Tool with Priority Support

1. Create a new file in `src/tools/`
2. Define your tool and implement a `register` function
3. Use the priority parameter when registering high-priority tools
4. Register it in `src/tools/index.ts`

Example:

```typescript
// src/tools/criticalTool.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.js';

export const criticalTool = {
  register(server: McpServer) {
    // Register as a high-priority tool
    (server as any).tool(
      'critical-operation',
      async (params) => {
        logger.info(`Critical operation executing: ${JSON.stringify(params)}`);
        // Implement tool logic here
        return {
          content: [{ type: 'text', text: `Critical operation completed` }]
        };
      },
      10 // High priority value
    );
    logger.debug('Critical tool registered');
  }
};
```

Then in `src/tools/index.ts`:

```typescript
import { criticalTool } from './criticalTool.js';
criticalTool.register(server);
```

### Build & Run

Development mode:

```
npm run dev
```

Production build:

```
npm run build
```

Start production server:

```
npm start
```

Test Sequential MCP functionality:

```
npm run test:sequential
```

## Troubleshooting

### Common Issues

- **Connection errors**: Verify the MCP server URL in the Roblox Studio plugin
- **Authentication errors**: Check API keys in environment variables
- **Model creation failures**: Validate request format and check server logs
- **Sequential processing issues**: Ensure `USE_SEQUENTIAL=true` in .env

### Sequential MCP Specific Issues

- **Tasks not executing in priority order**: Ensure priorities are set correctly
- **Concurrency not taking effect**: Check if concurrency was updated after server start
- **Queue statistics showing incorrect values**: Restart the server to reset statistics

### Claude Desktop Connection Issues

- **Failed to connect**: Ensure the server is running and the correct URL is used
- **SSE connection drops**: Check for network issues and firewall settings
- **No response from Claude**: Verify the session ID is being correctly passed in requests
- **Heartbeat failures**: Check server logs for connection issues

Logs are saved in `logs/`:
- `combined.log`: all logs
- `error.log`: errors only
- `studio.log`: Roblox Studio related logs

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
