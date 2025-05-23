import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import http from 'http';
import { logger } from './utils/logger.js';
import { apiKeyAuth } from './utils/auth.js';
import * as sync from './utils/sync.js';
import { errorHandlerMiddleware, NotFoundError } from './utils/errorHandler.js';
import { roblexTools } from './tools/index.js';
import { roblexResources } from './resources/index.js';
import { roblexPrompts } from './prompts/index.js';
import { globalContext, globalProtocol, roblexStudioAdapterFactory } from './models/index.js';
import * as auth from './utils/auth.js';
import { security } from './utils/security.js';

// Import from SDK instead of local implementation
import { McpServer } from '@modelcontextprotocol/sdk';
import { SSEServerTransport } from './server/SSEServerTransport.js';
import { StdioServerTransport } from './server/StdioServerTransport.js';

// New imports for Sequential MCP
import { 
  McpServerFactory, 
  RoblexStudioSequentialMcp, 
  RoblexStudioService 
} from './server/index.js';

// Export our own components
export * from './server/index.js';
export * from './models/index.js';

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
const TRANSPORT_MODE = process.env.TRANSPORT_MODE || 'sse'; // 'sse' or 'stdio'
const CLAUDE_DESKTOP_ENABLED = process.env.CLAUDE_DESKTOP_ENABLED === 'true' || true;
const ENABLE_TPA_PROTECTION = process.env.ENABLE_TPA_PROTECTION === 'true' || true;

// Parse command line arguments for extended JSON options
const args = process.argv.slice(2);
const jsonOptions = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const option = args[i].slice(2);
    const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : 'true';
    jsonOptions[option] = value;
    if (value !== 'true') i++; // Skip the value in the next iteration
  }
}

// Check if we're running in STDIO mode
if (TRANSPORT_MODE === 'stdio') {
  // Initialize MCP server with STDIO transport
  logger.info(`Starting MCP Server in STDIO mode for Claude Desktop`);
  
  // Create appropriate MCP Server based on configuration
  let server: any;
  
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
      logger // SDK가 logger 옵션을 지원하는 경우
    });
    
    logger.info('Using standard MCP server');
  }
  
  // Register tools, resources, and prompts
  roblexTools.register(server);
  roblexResources.register(server);
  roblexPrompts.register(server);
  
  // Create STDIO transport
  const transport = new StdioServerTransport();
  
  // Add extended JSON options to the first server message
  transport.setExtendedOptions(jsonOptions);
  
  // Connect to MCP server
  (async () => {
    try {
      // Create a new Roblox Studio adapter for this session
      const adapter = roblexStudioAdapterFactory(transport.sessionId);
      adapter.connect();
      
      logger.info(`STDIO transport created with session ID: ${transport.sessionId}`);
      logger.info(`Extended JSON options: ${JSON.stringify(jsonOptions)}`);
      
      // Connect transport to server
      await server.connect(transport);
      
      // Handle process exit
      process.on('exit', () => {
        adapter.disconnect();
        transport.disconnect();
      });
    } catch (error) {
      logger.error(`Error in STDIO mode: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  })();
} else {
  // HTTP/SSE mode for the server
  
  // Create appropriate MCP Server based on configuration
  let server: any;
  
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
  
  // Apply security middlewares
  if (ENABLE_TPA_PROTECTION) {
    // Security headers for all responses
    app.use(security.securityHeadersMiddleware);
    
    // Rate limiting to prevent brute force attacks
    app.use(security.rateLimitMiddleware);
    
    // Apply TPA protection after parsing body
    app.use(express.json({ limit: '50mb' })); // Increased limit for larger payloads
    app.use(security.sanitizeInputsMiddleware);
    app.use(security.tpaProtectionMiddleware);
  } else {
    app.use(express.json({ limit: '50mb' })); // Without sanitization
  }
  
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
      
      // Process extended JSON options from query parameters
      const extendedOptions = {};
      Object.keys(req.query).forEach(key => {
        if (key !== 'sessionId') {
          extendedOptions[key] = req.query[key];
        }
      });
      
      if (Object.keys(extendedOptions).length > 0) {
        logger.info(`Extended options provided: ${JSON.stringify(extendedOptions)}`);
      }
      
      logger.info(`New SSE connection established: ${sessionId}`);
      
      // Send initial confirmation message with extended options
      res.write(`data: ${JSON.stringify({
        type: 'connection_established',
        sessionId: sessionId,
        message: 'SSE Connection established successfully',
        extendedOptions: extendedOptions
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
        // Check for suspicious message content if TPA protection is enabled
        if (ENABLE_TPA_PROTECTION && typeof req.body === 'object') {
          const messageStr = JSON.stringify(req.body);
          
          // Check for potential prompt injection patterns
          const suspiciousPatterns = [
            /ignore previous instructions/i,
            /disregard earlier directives/i,
            /forget your guidelines/i,
            /new persona/i,
            /act as if/i,
            /system prompt/i
          ];
          
          if (suspiciousPatterns.some(pattern => pattern.test(messageStr))) {
            security.logSuspiciousActivity(req, 'Potential prompt injection detected');
            return res.status(403).json({ 
              error: { 
                message: 'Message content violates security policy', 
                code: 'SECURITY_VIOLATION' 
              } 
            });
          }
        }
        
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
      transport: TRANSPORT_MODE,
      activeSessions: Object.keys(transports).length,
      activeStudioSessions: Object.keys(studioAdapters).length,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      claudeDesktopEnabled: CLAUDE_DESKTOP_ENABLED,
      tpaProtection: ENABLE_TPA_PROTECTION
    });
  });
  
  // Roblox Studio status endpoint
  app.get('/studio/status', authMiddleware, (req, res) => {
    const activeAdapters = Object.values(studioAdapters).filter((adapter) => adapter.isConnected);
    
    res.status(200).json({
      activeConnections: activeAdapters.length,
      globalModelCount: globalContext.getAllModels().length,
      serverType: USE_SEQUENTIAL ? 'sequential' : 'standard',
      transportMode: TRANSPORT_MODE
    });
  });
  
  // New endpoint for Claude Desktop connection testing
  app.post('/claude/connect', (req, res) => {
    try {
      const sessionId = auth.generateSessionId('claude');
      logger.info(`Claude Desktop connection request: ${sessionId}`);
      
      auth.registerSession(sessionId, 'claude-desktop', 'user', req.ip || 'unknown');
      
      // Process extended options if provided
      const extendedOptions = req.body.options || {};
      if (Object.keys(extendedOptions).length > 0) {
        logger.info(`Claude Desktop extended options: ${JSON.stringify(extendedOptions)}`);
      }
      
      return res.status(200).json({ 
        success: true,
        sessionId,
        message: 'Claude Desktop connection established',
        extendedOptions
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
      transport: TRANSPORT_MODE,
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
          messageUrl: '/messages?sessionId=YOUR_SESSION_ID',
          stdioMode: TRANSPORT_MODE === 'stdio'
        }
      },
      security: {
        tpaProtection: ENABLE_TPA_PROTECTION ? 'enabled' : 'disabled'
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
    logger.info(`Transport mode: ${TRANSPORT_MODE}, Claude Desktop support: ${CLAUDE_DESKTOP_ENABLED ? 'Enabled' : 'Disabled'}`);
    logger.info(`TPA Attack Protection: ${ENABLE_TPA_PROTECTION ? 'Enabled' : 'Disabled'}`);
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
  
  // Export the app and server for testing (using CommonJS exports instead of ES modules)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { app, server, httpServer };
  }
}
