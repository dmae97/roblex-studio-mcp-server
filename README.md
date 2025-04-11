![Roblex Studio MCP Server](docs/banner.jpg)

# Roblex Studio Model-Context-Protocol Server

The Roblex Studio MCP Server is a standalone server implementation of the [Model-Context-Protocol](https://github.com/microsoft/modelcontextprotocol) specification, designed specifically for integration with Roblox Studio. It provides a flexible and efficient way to connect large language models (LLMs) to Roblox Studio through a standardized interface.

## Features

- **Full MCP Implementation**: Complete support for the Model-Context-Protocol specification.
- **Sequential Processing**: Ensures stable and predictable interaction with Roblox Studio.
- **Multiple Transport Modes**: Supports both Server-Sent Events (SSE) and standard input/output (STDIO) for versatile connectivity.
- **Claude Integration**: Built-in support for Anthropic's Claude models.
- **Security Features**: Protection against TPA (Third-Party API) attacks and other security vulnerabilities.
- **Extensible Architecture**: Easy to extend with custom tools and resources.
- **Developer-Friendly**: Simple API and comprehensive documentation make integration straightforward.

## Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Setup

1. Clone the repository:

```bash
git clone https://github.com/dmae97/roblex-studio-mcp-server.git
cd roblex-studio-mcp-server
```

2. Install dependencies:

```bash
npm install
```

3. Copy the example environment file and update it with your settings:

```bash
cp .env.example .env
```

4. Build the project:

```bash
npm run build
```

5. Start the server:

```bash
npm start
```

## Usage

### Starting the Server

The server can be started in different modes:

- **Standard Mode**:
  ```bash
  npm start
  ```

- **SSE Transport Mode**:
  ```bash
  npm run start:sse
  ```

- **STDIO Transport Mode** (for integration with desktop applications):
  ```bash
  npm run start:stdio
  ```

- **Claude Desktop Mode**:
  ```bash
  npm run claude:desktop
  ```

### API Endpoints

- `GET /sse`: SSE connection endpoint
- `POST /messages?sessionId=<id>`: Send messages to the server
- `GET /health`: Health check endpoint
- `GET /studio/status`: Get Roblox Studio connection status

### Roblex Studio Integration

For Roblox Studio integration, use the following endpoints:

- `GET /api/roblox-studio/events`: SSE events for Roblox Studio
- `POST /api/roblox-studio/messages/:sessionId`: Send messages to Roblox Studio
- `POST /api/roblox-studio/disconnect/:sessionId`: Disconnect a Roblox Studio session

### Security Features

The server includes protection against TPA (Third-Party API) attacks and other security vulnerabilities:

- **Input Sanitization**: All user inputs are sanitized to prevent injection attacks.
- **Rate Limiting**: Prevents abuse through brute-force attacks.
- **Origin Validation**: Verifies that requests come from allowed domains.
- **Security Headers**: Implements secure HTTP headers to prevent common web vulnerabilities.
- **Pattern Blocking**: Blocks requests with suspicious patterns that might indicate malicious activity.
- **Prompt Injection Detection**: Detects and blocks attempts to manipulate the LLM through prompt injection.

These security features can be configured in the `.env` file:

```
# Security Settings
ENABLE_TPA_PROTECTION=true
ALLOWED_DOMAINS=localhost,127.0.0.1
SANITIZE_INPUTS=true
BLOCK_EXTERNAL_REQUESTS=true
SECURITY_HEADERS=true
```

## Development

### Project Structure

```
roblex-studio-mcp-server/
├── src/
│   ├── examples/         # Example implementations
│   ├── models/           # Model interfaces and implementations
│   ├── plugins/          # Plugin system
│   ├── prompts/          # Prompt templates
│   ├── resources/        # Resource definitions
│   ├── server/           # Server implementation
│   ├── tools/            # Tool implementations
│   ├── utils/            # Utility functions
│   └── index.ts          # Main entry point
├── docs/                 # Documentation
└── test-server/          # Testing utilities
```

### Available Scripts

- `npm run clean`: Clean the build directory
- `npm run build`: Build the project
- `npm run dev`: Run the server in development mode
- `npm run test`: Run tests
- `npm run lint`: Lint the code
- `npm run format`: Format the code
- `npm run docs`: Generate documentation

## Troubleshooting

### Common Issues

If you encounter build errors related to TypeScript, try the following steps:

1. Clear the build directory:
   ```bash
   npm run clean
   ```

2. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Build with verbose output:
   ```bash
   npm run build -- --verbose
   ```

### Module Resolution Issues

If you encounter module resolution issues, make sure you're using the proper import statements without file extensions:

```typescript
// Correct
import { MyModule } from './path/to/module';

// Incorrect
import { MyModule } from './path/to/module.js';
```

### TPA Attack Protection Issues

If you're experiencing issues with the TPA attack protection:

1. Check that the domains you're using are added to the `ALLOWED_DOMAINS` list in your `.env` file.
2. If you need to temporarily disable TPA protection for debugging, set `ENABLE_TPA_PROTECTION=false` in your `.env` file.
3. If you're using legitimate external APIs that are being blocked, you can modify the blocked patterns in `src/utils/security.ts`.

## Environment Variables

The server can be configured using the following environment variables:

- `PORT`: HTTP server port (default: 3001)
- `TRANSPORT_MODE`: Transport mode ('sse' or 'stdio', default: 'sse')
- `LOG_LEVEL`: Logging level (default: 'info')
- `REQUIRE_AUTH`: Whether to require authentication (default: false)
- `ADMIN_PASSWORD`: Password for admin authentication
- `JWT_SECRET`: Secret for JWT token generation
- `TOKEN_EXPIRATION`: Token expiration time in seconds
- `SESSION_TIMEOUT`: Session timeout in seconds
- `SEQUENTIAL_CONCURRENCY`: Number of concurrent requests for sequential mode (default: 1)
- `ENABLE_TPA_PROTECTION`: Enable protection against TPA attacks (default: true)
- `ALLOWED_DOMAINS`: Comma-separated list of allowed domains for requests
- `CLAUDE_DESKTOP_ENABLED`: Enable Claude Desktop integration (default: true)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Microsoft Model-Context-Protocol](https://github.com/microsoft/modelcontextprotocol)
- [Anthropic Claude](https://www.anthropic.com/claude)
- [Roblox Studio](https://www.roblox.com/create)

---

© 2025 Roblex Studio MCP Server Contributors