import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import http from 'http';
import { logger } from './utils/logger.js';
import { apiKeyAuth } from './utils/auth';
import * as sync from './utils/sync';
import { errorHandlerMiddleware, NotFoundError } from './utils/errorHandler';
import { roblexTools } from './tools/index';
import { roblexResources } from './resources/index';
import { roblexPrompts } from './prompts/index';
import { globalContext, globalProtocol, roblexStudioAdapterFactory } from './models/index';
import * as auth from './utils/auth';

// Import our own implementations instead of from typescript-sdk
import { McpServer } from './server/McpServer.js';
import { SSEServerTransport } from './server/SSEServerTransport.js';

// New imports for Sequential MCP
import { 
  McpServerFactory, 
  RoblexStudioSequentialMcp, 
  RoblexStudioService 
} from './server/index';

// Export our own components
export * from './server/index';
export * from './models/index';

// Load environment variables
dotenv.config();

// Initialize authentication system
auth.init();

// Server configuration
const PORT = Number(process.env.PORT || 3001);
const SERVER_NAME = process.env.SERVER_NAME || 'Roblex Studio MCP Server';
const SERVER_VERSION = process.env.SERVER_VERSION || '1.0.0';
const REQUIRE_AUTH = process.env.REQUIRE_AUTH === 'true';
const USE_SEQUENTIAL = process.env.USE_SEQUENTIAL === 'true';

// Create appropriate MCP Server based on configuration
let server: McpServer;

if (USE_SEQUENTIAL) {
  // Create a Sequential MCP Server
  const concurrency = Number(process.env.SEQUENTIAL_CONCURRENCY || 1);
  server = McpServerFactory.createSequential({
    name: SERVER_NAME,
    version: SERVER_VERSION,
    logger // Pass the custom logger
  }, concurrency);
  
  logger.info(`Using Sequential MCP server with concurrency: ${concurrency}`);
} else {
  // Create a standard MCP Server
  server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
    logger // Pass the custom logger
  });
  
  logger.info('Using standard MCP server');
}

// Register tools, resources, and prompts
roblexTools.register(server);
roblexResources.register(server);
roblexPrompts.register(server);

// Create Express app
const app = express();

// Enhanced CORS configuration to support desktop applications
const corsOptions = {
  origin: function(origin, callback) {
    // Allow all origins (necessary for desktop applications)
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // Increased limit for larger payloads
app.use(cookieParser());

// Add heartbeat endpoint for connection testing
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Create HTTP server from Express app
const httpServer = http.createServer(app);

// Storage for active transports
const transports: { [sessionId: string]: SSEServerTransport } = {};

// Storage for active Roblox Studio adapters
const studioAdapters: { [sessionId: string]: ReturnType<typeof roblexStudioAdapterFactory> } = {};

// Authentication middleware for protected routes
const authMiddleware = REQUIRE_AUTH ? apiKeyAuth : (req: express.Request, res: express.Response, next: express.NextFunction) => next();

// Login endpoint
app.post('/auth/login', async (req, res) => {
  const { username, password, apiKey } = req.body;
  
  // Check if using API key authentication
  if (apiKey) {
    const result = auth.verifyApiKey(apiKey);
    
    if (!result.valid) {
      return res.status(403).json({ error: 'Invalid API key' });
    }
    
    const sessionId = auth.generateSessionId('api');
    auth.registerSession(sessionId, result.name || 'api-user', result.role || 'user', req.ip || 'unknown');
    
    const token = auth.createToken({ 
      sessionId, 
      name: result.name, 
      role: result.role 
    });
    
    return res.status(200).json({ 
      token,
      sessionId,
      user: { name: result.name, role: result.role }
    });
  }
  
  // Simple username/password authentication (replace with proper auth in production)
  if (username === 'admin' && password === process.env.ADMIN_PASSWORD) {
    const sessionId = auth.generateSessionId('user');
    auth.registerSession(sessionId, username, 'admin', req.ip || 'unknown');
    
    const token = auth.createToken({ 
      sessionId, 
      username, 
      role: 'admin' 
    });
    
    // Set session cookie
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: Number(process.env.SESSION_TIMEOUT || 3600) * 1000 // Use session timeout from env
    });
    
    return res.status(200).json({ 
      token,
      sessionId,
      user: { username, role: 'admin' }
    });
  }
  
  return res.status(401).json({ error: 'Invalid credentials' });
});

// Logout endpoint
app.post('/auth/logout', (req, res) => {
  const sessionId = req.query.sessionId as string || req.cookies?.sessionId;
  
  if (sessionId) {
    auth.revokeSession(sessionId);
    
    // Clear session cookie
    res.clearCookie('sessionId');
    
    // Disconnect any active adapter
    if (studioAdapters[sessionId]) {
      studioAdapters[sessionId].disconnect();
      delete studioAdapters[sessionId];
    }
    
    return res.status(200).json({ success: true });
  }
  
  return res.status(400).json({ error: 'No active session' });
});

// SSE endpoint with improved error handling for Claude Desktop
app.get('/sse', authMiddleware, async (req, res) => {
  try {
    const transport = new SSEServerTransport('/messages', res);
    const sessionId = req.query.sessionId as string || transport.sessionId;
    
    // Set headers for better SSE stability
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    transports[sessionId] = transport;
    
    // Create a new Roblox Studio adapter for this session
    const adapter = roblexStudioAdapterFactory(sessionId);
    studioAdapters[sessionId] = adapter;
    adapter.connect();
    
    // Register the session if it's not already registered
    if (!auth.isSessionValid(sessionId)) {
      const userId = (req as any).apiKey?.name || 'anonymous';
      const role = (req as any).apiKey?.role || 'user';
      auth.registerSession(sessionId, userId, role, req.ip || 'unknown');
    } else {
      auth.updateSessionActivity(sessionId);
    }
    
    logger.info(`New SSE connection established: ${sessionId}`);
    
    // Send initial confirmation message
    res.write(`data: ${JSON.stringify({
      type: 'connection_established',
      sessionId: sessionId,
      message: 'SSE Connection established successfully'
    })}\n\n`);
    
    res.on('close', () => {
      logger.info(`SSE connection closed: ${sessionId}`);
      
      // Disconnect the Roblox Studio adapter
      if (studioAdapters[sessionId]) {
        studioAdapters[sessionId].disconnect();
        delete studioAdapters[sessionId];
      }
      
      delete transports[sessionId];
    });
    
    await server.connect(transport);
  } catch (error) {
    logger.error(`SSE connection error: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).end();
  }
});

// If using Sequential MCP, create and register the RoblexStudioService
if (USE_SEQUENTIAL) {
  // Create Roblox Studio service with sequential MCP
  const studioService = new RoblexStudioService({
    version: SERVER_VERSION,
    apiPrefix: '/api/roblox-studio',
    concurrency: Number(process.env.SEQUENTIAL_CONCURRENCY || 1)
  });
  
  // Register the service's router
  app.use('/', studioService.router);
  
  logger.info(`RoblexStudioService registered on prefix: /api/roblox-studio`);
}

// Messages endpoint with improved error handling
app.post('/messages', authMiddleware, async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];
  
  if (transport) {
    // Update session activity
    auth.updateSessionActivity(sessionId);
    
    try {
      // Debugging for request body
      logger.debug(`Received message: ${JSON.stringify(req.body)}`);
      await transport.handlePostMessage(req, res);
    } catch (error) {
      logger.error(`Error handling message: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: { message: 'Error processing message', code: 'MESSAGE_ERROR' } });
    }
  } else {
    logger.error(`No transport found for sessionId: ${sessionId}`);
    res.status(400).send('No transport found for sessionId');
  }
});

// Studio API endpoint - For direct communication from Studio plugin
app.post('/studio/api', authMiddleware, async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const adapter = studioAdapters[sessionId];
  
  if (!adapter) {
    logger.error(`No Roblox Studio adapter found for sessionId: ${sessionId}`);
    res.status(400).json({ error: 'No active Roblox Studio session found' });
    return;
  }
  
  try {
    // Assuming the plugin sends messages in the format { messageType, data }
    const { messageType, data } = req.body;
    logger.info(`Received studio message: ${messageType}`, { sessionId, data });
    
    // Let the adapter handle the message
    const result = await adapter.handleMessage(messageType, data);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Error handling Roblox Studio message`, { 
      error: error instanceof Error ? error.message : String(error),
      sessionId
    });
    res.status(500).json({ error: 'Error processing request' });
  }
});

// Enhanced health check endpoint with additional connection info
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    name: SERVER_NAME,
    version: SERVER_VERSION,
    type: USE_SEQUENTIAL ? 'sequential' : 'standard',
    activeSessions: Object.keys(transports).length,
    activeStudioSessions: Object.keys(studioAdapters).length,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    claudeDesktopEnabled: true
  });
});

// Roblox Studio status endpoint
app.get('/studio/status', authMiddleware, (req, res) => {
  const activeAdapters = Object.values(studioAdapters).filter((adapter) => adapter.isConnected);
  
  res.status(200).json({
    activeConnections: activeAdapters.length,
    globalModelCount: globalContext.getAllModels().length,
    serverType: USE_SEQUENTIAL ? 'sequential' : 'standard'
  });
});

// New endpoint for Claude Desktop connection testing
app.post('/claude/connect', (req, res) => {
  try {
    const sessionId = auth.generateSessionId('claude');
    logger.info(`Claude Desktop connection request: ${sessionId}`);
    
    auth.registerSession(sessionId, 'claude-desktop', 'user', req.ip || 'unknown');
    
    return res.status(200).json({ 
      success: true,
      sessionId,
      message: 'Claude Desktop connection established'
    });
  } catch (error) {
    logger.error(`Claude Desktop connection error: ${error instanceof Error ? error.message : String(error)}`);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to establish Claude Desktop connection'
    });
  }
});

// Root path handler for Claude Desktop connection
app.get('/', (req, res) => {
  res.status(200).json({
    name: SERVER_NAME,
    version: SERVER_VERSION,
    description: 'Roblox Studio MCP Server with Claude Desktop integration',
    status: 'running',
    docs: {
      endpoints: [
        { path: '/ping', method: 'GET', description: 'Simple heartbeat endpoint' },
        { path: '/health', method: 'GET', description: 'Server health and status information' },
        { path: '/sse', method: 'GET', description: 'SSE connection endpoint' },
        { path: '/messages', method: 'POST', description: 'Send messages to the server' },
        { path: '/claude/connect', method: 'POST', description: 'Connect to Claude Desktop' }
      ],
      claudeDesktop: {
        connectionUrl: '/claude/connect',
        sseUrl: '/sse',
        messageUrl: '/messages?sessionId=YOUR_SESSION_ID'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Add error handler middleware
app.use(errorHandlerMiddleware);

// Add 404 handler
app.use((req, res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.path}`));
});

// Start the server
httpServer.listen(PORT, () => {
  logger.info(`${SERVER_NAME} v${SERVER_VERSION} listening on port ${PORT}`);
  logger.info(`Mode: ${USE_SEQUENTIAL ? 'Sequential' : 'Standard'} MCP, Auth: ${REQUIRE_AUTH ? 'Required' : 'Not Required'}`);
  logger.info(`Claude Desktop integration enabled`);
});

// Handle graceful shutdown
function gracefulShutdown() {
  logger.info('Received shutdown signal, closing connections...');
  
  // Disconnect all Studio adapters
  Object.values(studioAdapters).forEach(adapter => {
    try {
      adapter.disconnect();
    } catch (error) {
      logger.error('Error disconnecting adapter', { error });
    }
  });
  
  // Close the HTTP server
  httpServer.close(() => {
    logger.info('Server shutdown complete');
    process.exit(0);
  });
  
  // Force exit after timeout
  setTimeout(() => {
    logger.error('Forced exit after timeout');
    process.exit(1);
  }, 10000);
}

// Listen for shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Export the app and server for testing
export { app, server, httpServer };
