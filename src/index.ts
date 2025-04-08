import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { McpError } from '@modelcontextprotocol/sdk/types';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import dotenv from 'dotenv';
import http from 'http';
import { logger } from './utils/logger';
import { apiKeyAuth } from './utils/auth';
import * as sync from './utils/sync';
import { errorHandlerMiddleware, NotFoundError } from './utils/errorHandler';
import { roblexTools } from './tools/index';
import { roblexResources } from './resources/index';
import { roblexPrompts } from './prompts/index';
import { globalContext, globalProtocol, roblexStudioAdapterFactory } from './models/index';
import * as auth from './utils/auth';

// Load environment variables
dotenv.config();

// Initialize authentication system
auth.init();

// Server configuration
const PORT = Number(process.env.PORT || 3001);
const SERVER_NAME = process.env.SERVER_NAME || 'Roblex Studio MCP Server';
const SERVER_VERSION = process.env.SERVER_VERSION || '1.0.0';
const REQUIRE_AUTH = process.env.REQUIRE_AUTH === 'true';

// Create MCP Server
const server = new McpServer({
  name: SERVER_NAME,
  version: SERVER_VERSION,
  logger // Pass the custom logger
});

// Register tools, resources, and prompts
roblexTools.register(server);
roblexResources.register(server);
roblexPrompts.register(server);

// Create Express app
const app = express();

// Configure CORS
const corsOptions = {
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

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

// SSE endpoint
app.get('/sse', authMiddleware, async (req, res) => {
  const transport = new SSEServerTransport('/messages', res);
  const sessionId = req.query.sessionId as string || transport.sessionId;
  
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
});

// Messages endpoint
app.post('/messages', authMiddleware, async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];
  
  if (transport) {
    // Update session activity
    auth.updateSessionActivity(sessionId);
    
    await transport.handlePostMessage(req, res);
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    name: SERVER_NAME,
    version: SERVER_VERSION,
    activeSessions: Object.keys(transports).length,
    activeStudioSessions: Object.keys(studioAdapters).length
  });
});

// Roblox Studio status endpoint
app.get('/studio/status', authMiddleware, (req, res) => {
  const activeAdapters = Object.values(studioAdapters).filter((adapter) => adapter.isConnected);
  
  res.status(200).json({
    activeConnections: activeAdapters.length,
    globalModelCount: globalContext.getAllModels().length,
    // Cannot directly access private _handlers, so we'll omit this for now
    // handlers: Array.from(new Set(
    //   Object.values(studioAdapters).flatMap((adapter) => 
    //     Array.from(adapter.protocol._handlers.keys())
    //   )
    // ))
  });
});

// Secured API endpoints
const securedRouter = express.Router();
app.use('/api', authMiddleware, securedRouter);

// Get all sessions endpoint
securedRouter.get('/sessions', (req, res) => {
  // Only admin users can access this endpoint
  const userRole = (req as any).apiKey?.role || (req as any).user?.role;
  
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  
  const sessionIds = Object.keys(transports);
  const sessions = sessionIds.map(sessionId => ({
    sessionId,
    hasStudioAdapter: !!studioAdapters[sessionId],
    sessionInfo: auth.getSessionInfo(sessionId)
  }));
  
  res.status(200).json({ sessions });
});

// Get model by ID endpoint
securedRouter.get('/models/:modelId', (req, res) => {
  const modelId = req.params.modelId;
  const model = globalContext.getModel(modelId);
  
  if (!model) {
    return res.status(404).json({ error: `Model ${modelId} not found` });
  }
  
  res.status(200).json({
    id: model.name,
    state: model.state
  });
});

// Initialize WebSocket synchronization system
// WebSocket 동기화 시스템 비활성화 (포트 충돌 문제 해결)
// sync.init(httpServer, '/sync');
// 대신 로그 메시지만 출력
logger.info('WebSocket synchronization system was disabled to prevent port conflicts');

// Add 404 handler for non-existing routes
app.use((req, res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.path}`));
});

// Add error handling middleware
app.use(errorHandlerMiddleware);

// Start the server
httpServer.listen(PORT, () => {
  logger.info(`${SERVER_NAME} v${SERVER_VERSION} started on port ${PORT}`);
  logger.info(`SSE endpoint: http://localhost:${PORT}/sse`);
  // WebSocket 동기화 엔드포인트 메시지 제거
  // logger.info(`WebSocket sync endpoint: ws://localhost:${PORT}/sync`);
});

// Graceful shutdown handler
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    error: error.toString()
  });
  gracefulShutdown(); // Attempt graceful shutdown on uncaught exception
});

function gracefulShutdown() {
  logger.info('Graceful shutdown initiated...');
  
  // Close active connections
  Object.keys(studioAdapters).forEach(sessionId => {
    const adapter = studioAdapters[sessionId];
    if (adapter) {
      try {
        adapter.disconnect();
        logger.info(`Disconnected Roblox Studio adapter: ${sessionId}`);
      } catch (error) {
        logger.error(`Error disconnecting adapter ${sessionId}`, { 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });
  
  // Close HTTP server
  httpServer.close(() => {
    logger.info('HTTP server closed');
    // Additional cleanup if needed
    process.exit(0);
  });
  
  // Force exit after timeout
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}
