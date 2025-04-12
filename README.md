![Roblex Studio MCP Server](docs/banner.jpg)

# Roblex Studio Model-Context-Protocol Server

The Roblex Studio MCP Server is a standalone server implementation of the [Model-Context-Protocol](https://github.com/microsoft/modelcontextprotocol) specification, designed specifically for integration with Roblox Studio and LLMs. It enables seamless, secure, and scriptable AI-driven workflows in Roblox Studio via a unified protocol.

## Features

- **npx One-line Install/Run**: Launch instantly with `npx roblex-mcp`
- **Automatic Roblox Studio Launch**: MCP starts and auto-launches Roblox Studio (Windows)
- **Full MCP Implementation**: All core Model-Context-Protocol features supported
- **Multiple Transport Modes**: SSE or STDIO for flexible integration
- **Claude Desktop/Anthropic Claude Support**: Out-of-the-box integration
- **Security**: TPA protection, input sanitization, rate limiting, CORS, and more
- **Extensible**: Easily add custom tools/resources

## Quick Start

### Prerequisites

- Node.js 18 or higher (Node.js 20+ recommended)
- Roblox Studio installed (Windows; see below for launch path)
- npm (bundled with Node.js)

### Run with npx

```bash
npx roblex-mcp
```

- On first launch, MCP will start and attempt to open Roblox Studio automatically.
- If your Roblox Studio is not in a standard location, set the `ROBLOX_STUDIO_PATH` environment variable in your `.env` file or system environment.

### Env Setup

Copy and edit the example environment file:

```bash
cp .env.example .env
```

Edit `.env` as needed (see below for ROBLOX_STUDIO_PATH).

## Roblox/Open Cloud API Key Setup

To enable automated scripting and asset management, you must supply a valid Roblox Open Cloud API Key.

1. Go to the [Roblox Open Cloud dashboard](https://create.roblox.com/credentials/open-cloud).
2. Click **Create API Key**, select the required permissions (e.g., "Write Assets", "Read Universe Data"), and copy your generated API key.
3. Place this key in your `.env` file:
    ```
    ROBLOX_API_KEY=your_api_key_here
    ROBLOX_OPEN_CLOUD_API_KEY=your_open_cloud_api_key_here
    ```
   - Never share your secret keys. Treat them like passwords.
   - Optionally, set `ROBLOX_OPEN_CLOUD_UNIVERSE_ID` for universe-scoped operations.

4. Restart MCP after editing `.env` to apply changes.

See [Roblox Open Cloud documentation](https://create.roblox.com/docs/open-cloud) for more details.

## Environment Variables

All configuration can be controlled with a `.env` file. Key variables:

- `PORT`: Server port (default: 3001)
- `TRANSPORT_MODE`: 'sse' or 'stdio' (default: 'stdio')
- `CLAUDE_DESKTOP_ENABLED`: Claude Desktop integration (default: true)
- `ROBLOX_STUDIO_PATH`: Full path to RobloxStudioBeta.exe (optional). Example:
  
  ```
  ROBLOX_STUDIO_PATH=C:\Users\USER\AppData\Local\Roblox\Versions\version-04a222f011414c81\RobloxStudioBeta.exe
  ```

- `ROBLOX_API_KEY`, `ROBLOX_OPEN_CLOUD_API_KEY`: Your API keys from Roblox Open Cloud; **required** for most server features.

See [.env.example](.env.example) for all options.

## How It Works

- **npx roblex-mcp**:
  - Starts the MCP server (transports, tools, API, security, etc)
  - Launches Roblox Studio automatically
  - Can be integrated with Claude Desktop, Open Cloud, etc.

- **Custom Tools and Resources**:
  - Add your own by extending the `src/tools` and `src/resources` directories.

## Troubleshooting

- **Roblox Studio does not open?**
  - Set `ROBLOX_STUDIO_PATH` in your `.env` to the full path of your `RobloxStudioBeta.exe`.

- **API Key errors or "Unauthorized"?**
  - Ensure your API keys are valid, have the correct permissions, and are set in `.env`.

- **Permission errors or port conflicts?**
  - Ensure you have privileges to bind the server port, or choose a non-standard port in `.env`.

- **TypeScript/Module errors?**
  - Run `npm install` and `npm run build` if developing locally, but npx users do not need this.

- **Claude Desktop not detected?**
  - Ensure `CLAUDE_DESKTOP_ENABLED=true` in `.env` and that Claude Desktop is running.

## Development

Clone, install, and build:

```bash
git clone https://github.com/dmae97/roblex-studio-mcp-server.git
cd roblex-studio-mcp-server
npm install
npm run build
npm start
```

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE)

---

© 2025 Roblex Studio MCP Server Contributors