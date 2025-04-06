import express from 'express';
import cors from 'cors';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import dotenv from 'dotenv';
import { roblexTools } from './tools/index.js';
import { roblexResources } from './resources/index.js';
import { roblexPrompts } from './prompts/index.js';
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

// Server configuration
const PORT = process.env.PORT || 3000;
const SERVER_NAME = process.env.SERVER_NAME || 'Roblex Studio MCP Server';
const SERVER_VERSION = process.env.SERVER_VERSION || '1.0.0';

// Create MCP Server
const server = new McpServer({
  name: SERVER_NAME,
  version: SERVER_VERSION
});

// Register tools, resources, and prompts
roblexTools.register(server);
roblexResources.register(server);
roblexPrompts.register(server);

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Storage for active transports
const transports: { [sessionId: string]: SSEServerTransport } = {};

// SSE endpoint
app.get('/sse', async (_, res) => {
  const transport = new SSEServerTransport('/messages', res);
  transports[transport.sessionId] = transport;
  
  logger.info(`New SSE connection established: ${transport.sessionId}`);
  
  res.on('close', () => {
    logger.info(`SSE connection closed: ${transport.sessionId}`);
    delete transports[transport.sessionId];
  });
  
  await server.connect(transport);
});

// Messages endpoint
app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];
  
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    logger.error(`No transport found for sessionId: ${sessionId}`);
    res.status(400).send('No transport found for sessionId');
  }
});

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({
    status: 'ok',
    name: SERVER_NAME,
    version: SERVER_VERSION,
    activeSessions: Object.keys(transports).length
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Roblex Studio MCP Server running on port ${PORT}`);
});

// Handle process exit
process.on('SIGINT', () => {
  logger.info('Server shutting down...');
  process.exit(0);
});
