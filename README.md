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
  - [Transport Modes (SSE/Stdio)](#transport-modes)
  - [Extended JSON Parameters](#extended-json-parameters)
  - [Connecting with Claude Desktop](#connecting-with-claude-desktop)
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
- **Multiple Transport Modes**: Both Server-Sent Events (SSE) and Standard I/O (Stdio) for communication
- **Roblox Studio Integration**: Specialized tools and models for Roblox Studio
- **Claude Desktop Integration**: Connect Claude Desktop to enhance your workflow
- **Extended JSON Parameters**: Customizable options for Claude models and server behavior
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

- **Multiple Transport Modes**: Both Server-Sent Events (SSE) and Standard I/O (Stdio) connections
- **Reliable SSE Connections**: Improved Server-Sent Events transport with heartbeat mechanism
- **Efficient Stdio Option**: Direct standard input/output mode for Desktop apps
- **Extended JSON Parameters**: Customizable options for Claude models and behavior
- **Automatic Reconnection**: Connection recovery features for robust operation
- **Specialized Endpoints**: Dedicated endpoints for Claude Desktop communication
- **Enhanced Error Handling**: Better error recovery and logging for connection issues
- **Simple Authentication**: Streamlined authentication process for Claude Desktop

### Transport Modes

The server supports two transport modes for communication with Claude Desktop:

1. **Server-Sent Events (SSE)** - Default mode for web-based connections
   - Real-time bidirectional communication over HTTP
   - Compatible with browser-based clients
   - Maintains persistent connections with heartbeats
   - Better for network-based connections

2. **Standard I/O (Stdio)** - New mode for desktop application integration
   - Direct process input/output for efficient local communication
   - Lower latency for Claude Desktop on the same machine
   - No networking overhead or connection limits
   - Better for secure local desktop integration

Switch between modes using the `TRANSPORT_MODE` environment variable or start scripts:

```bash
# Start server in SSE mode (default)
npm run start:sse

# Start server in Stdio mode
npm run start:stdio

# Connect to Claude Desktop with extended parameters
npm run claude:desktop
```

### Extended JSON Parameters

The server now supports extended JSON parameters for Claude Desktop integration. These parameters can be passed as command-line arguments or query parameters to customize the behavior of the server and Claude models:

| Parameter | Description | Example Value |
|-----------|-------------|---------------|
| `model` | Claude model to use | `claude-3-7-sonnet` |
| `context_length` | Maximum context window size | `200000` |
| `max_tokens` | Maximum generated tokens | `4096` |
| `temperature` | Response randomness | `0.7` |
| `top_p` | Nucleus sampling parameter | `0.9` |
| `top_k` | Top-k sampling parameter | `50` |
| `custom_instructions` | Custom Claude instructions | `Prioritize code examples` |

These parameters are included in the initial connection message to Claude Desktop and help configure the AI assistant's behavior for optimal integration with your development workflow.

### Connecting with Claude Desktop

To connect Claude Desktop to your MCP server:

#### SSE Mode (Web-based)

1. Ensure the server is running in SSE mode: `npm run start:sse`
2. In Claude Desktop, point the connection to `http://localhost:3001/claude/connect`
3. For SSE streaming, use the endpoint `http://localhost:3001/sse`
4. For message posting, use `http://localhost:3001/messages?sessionId=YOUR_SESSION_ID`
5. Add custom parameters as query parameters: `?model=claude-3-7-sonnet&context_length=200000`

#### Stdio Mode (Direct Desktop Integration)

1. Start the server in Stdio mode with your desired parameters:
   ```
   npm run claude:desktop -- --model claude-3-7-sonnet --context_length 200000 --max_tokens 4096
   ```
2. Claude Desktop will automatically connect through the standard input/output streams
3. No URLs or network configuration needed

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
| `TRANSPORT_MODE` | Transport mode (`sse` or `stdio`) | `sse` |
| `CLAUDE_DESKTOP_ENABLED` | Enable Claude Desktop integration | `true` |
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

### Using Claude Desktop with SSE Mode

```javascript
// Establish connection to Claude Desktop with SSE transport
fetch('http://localhost:3001/claude/connect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientName: 'MyDevelopmentTool',
    options: {
      model: 'claude-3-7-sonnet',
      context_length: 200000,
      max_tokens: 4096
    }
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

### Using Claude Desktop with Stdio Mode

```bash
# Start the server with Stdio transport and extended parameters
npm run claude:desktop -- --model claude-3-7-sonnet --context_length 200000 --custom_instructions "You are a Roblox development assistant"
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
│   │   ├── SSEServerTransport.ts  # SSE transport
│   │   ├── StdioServerTransport.ts # Stdio transport for desktop
│   │   └── SequentialMcpServer.ts # Enhanced Sequential MCP
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

Start with Stdio mode for Claude Desktop:

```
npm run claude:desktop
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

### Transport Mode Issues

- **SSE mode not working**: Check network connectivity and firewall settings
- **Stdio mode not connecting**: Ensure process has stdin/stdout access
- **Cannot switch modes**: Set `TRANSPORT_MODE` in .env or use appropriate start script

### Extended JSON Parameters Issues

- **Parameters not being applied**: Ensure they're passed correctly in CLI or query params
- **Invalid parameter values**: Check parameter format and acceptable ranges
- **Parameters not appearing in logs**: Enable debug logging to see parameter processing

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
