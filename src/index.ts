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

<<<<<<< Updated upstream
// Initialize authentication system
auth.init();

// Server configuration
const PORT = Number(process.env.PORT || 3001);
=======
// 디버깅 모드 설정
process.env.LOG_LEVEL = 'debug';

// 인증 시스템 초기화
auth.init();

// 서버 설정
const PORT = process.env.PORT || 3333;
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
// Configure CORS
=======
// CORS 설정 - 모든 출처 허용으로 설정 (개발 환경용)
>>>>>>> Stashed changes
const corsOptions = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

<<<<<<< Updated upstream
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
=======
// 인증 미들웨어 - 개발을 위해 항상 통과하도록 설정
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => next();

// 기본 라우트 - 서버가 실행 중인지 확인용
app.get('/', (req, res) => {
  logger.info('루트 엔드포인트 요청 받음');
  res.json({ 
    status: 'ok',
    name: SERVER_NAME,
    version: SERVER_VERSION
  });
});

// 로그인 엔드포인트
app.post('/auth/login', (async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  logger.logRequest('/auth/login', req.body);
  
  const { username, password, apiKey } = req.body;
  
  // 항상 성공으로 처리 (테스트를 위해)
  const sessionId = auth.generateSessionId('test');
  auth.registerSession(sessionId, 'test-user', 'user', req.ip || 'unknown');
  
  const token = auth.createToken({ 
    sessionId, 
    name: 'test-user', 
    role: 'user' 
  });
  
  const response = { 
    token,
    sessionId,
    user: { name: 'test-user', role: 'user' }
  };
  
  logger.logResponse('/auth/login', response);
  res.status(200).json(response);
}) as express.RequestHandler);

// 로그아웃 엔드포인트
app.post('/auth/logout', ((req: express.Request, res: express.Response, next: express.NextFunction): void => {
  logger.logRequest('/auth/logout', { query: req.query, cookies: req.cookies });
  
>>>>>>> Stashed changes
  const sessionId = req.query.sessionId as string || req.cookies?.sessionId;
  
  if (sessionId) {
    auth.revokeSession(sessionId);
<<<<<<< Updated upstream
    
    // Clear session cookie
    res.clearCookie('sessionId');
    
    // Disconnect any active adapter
=======
    res.clearCookie('sessionId');
    
>>>>>>> Stashed changes
    if (studioAdapters[sessionId]) {
      studioAdapters[sessionId].disconnect();
      delete studioAdapters[sessionId];
    }
    
<<<<<<< Updated upstream
    return res.status(200).json({ success: true });
  }
  
  return res.status(400).json({ error: 'No active session' });
});

// SSE endpoint
app.get('/sse', authMiddleware, async (req, res) => {
=======
    logger.logResponse('/auth/logout', { success: true });
    res.status(200).json({ success: true });
    return;
  }
  
  logger.logResponse('/auth/logout', { error: 'No active session' });
  res.status(400).json({ error: 'No active session' });
}) as express.RequestHandler);

// Claude 서버 메타데이터 엔드포인트 - Claude Desktop에서 MCP 서버 정보를 확인하는 데 사용
app.get('/server.json', (req, res) => {
  logger.info('서버 메타데이터 요청 받음');
  const metadata = {
    name: SERVER_NAME,
    version: SERVER_VERSION,
    description: "Roblex Studio MCP 서버",
    tools: roblexTools.getToolList(),
    resources: roblexResources.getResourceList()
  };
  
  logger.logResponse('/server.json', metadata);
  res.json(metadata);
});

// SSE 엔드포인트
app.get('/sse', ((req: express.Request, res: express.Response, next: express.NextFunction): void => {
  // 요청 로깅
  logger.logRequest('/sse', { query: req.query, headers: req.headers });
  logger.info('새 SSE 연결 요청 받음');
  
  // SSE 트랜스포트 생성
>>>>>>> Stashed changes
  const transport = new SSEServerTransport('/messages', res);
  const sessionId = req.query.sessionId as string || transport.sessionId;
  
  // 트랜스포트 저장
  transports[sessionId] = transport;
  
  // Create a new Roblox Studio adapter for this session
  const adapter = roblexStudioAdapterFactory(sessionId);
  studioAdapters[sessionId] = adapter;
  adapter.connect();
  
  // Register the session if it's not already registered
  if (!auth.isSessionValid(sessionId)) {
    const userId = 'anonymous';
    const role = 'user';
    auth.registerSession(sessionId, userId, role, req.ip || 'unknown');
  } else {
    auth.updateSessionActivity(sessionId);
  }
  
  logger.info(`SSE 연결 설정됨, 세션 ID: ${sessionId}`);
  logger.logMcpEvent('connection_established', { sessionId });
  
  res.on('close', () => {
<<<<<<< Updated upstream
    logger.info(`SSE connection closed: ${sessionId}`);
=======
    logger.info(`SSE 연결 종료됨: ${sessionId}`);
    logger.logMcpEvent('connection_closed', { sessionId });
    
    delete transports[sessionId];
>>>>>>> Stashed changes
    
    // Disconnect the Roblox Studio adapter
    if (studioAdapters[sessionId]) {
      studioAdapters[sessionId].disconnect();
      delete studioAdapters[sessionId];
    }
    
    delete transports[sessionId];
  });
  
<<<<<<< Updated upstream
  await server.connect(transport);
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

// Messages endpoint
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    name: SERVER_NAME,
    version: SERVER_VERSION,
    type: USE_SEQUENTIAL ? 'sequential' : 'standard',
    activeSessions: Object.keys(transports).length,
    activeStudioSessions: Object.keys(studioAdapters).length
  });
});

// Roblox Studio status endpoint
app.get('/studio/status', authMiddleware, (req, res) => {
=======
  // MCP 서버에 트랜스포트 연결
  server.connect(transport).catch(error => {
    logger.error(`MCP 서버에 트랜스포트 연결 오류: ${error}`);
  });
}) as express.RequestHandler);

// 메시지 엔드포인트
app.post('/messages', ((req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  // 요청 로깅
  logger.logRequest('/messages', req.body);
  
  return new Promise<void>(async (resolve) => {
    const sessionId = req.query.sessionId as string || req.body.sessionId;
    
    if (!sessionId) {
      logger.error('세션 ID가 제공되지 않음');
      res.status(400).json({ error: 'No session ID provided' });
      return resolve();
    }
    
    const transport = transports[sessionId];
    
    if (!transport) {
      logger.error(`트랜스포트를 찾을 수 없음: ${sessionId}`);
      res.status(404).json({ error: 'Transport not found' });
      return resolve();
    }
    
    try {
      const response = await transport.handlePostMessage(req);
      logger.logResponse('/messages', response);
      res.json(response);
      resolve();
    } catch (error: any) {
      logger.error(`메시지 처리 오류: ${error.message}`);
      res.status(500).json({ 
        error: 'Error handling message',
        message: error.message
      });
      resolve();
    }
  });
}) as express.RequestHandler);

// 스튜디오 상태 엔드포인트
app.get('/studio/status', ((req, res) => {
  logger.logRequest('/studio/status', { query: req.query });
  
>>>>>>> Stashed changes
  const activeAdapters = Object.values(studioAdapters).filter((adapter) => adapter.isConnected);
  
  const response = {
    activeConnections: activeAdapters.length,
<<<<<<< Updated upstream
    globalModelCount: globalContext.getAllModels().length,
    serverType: USE_SEQUENTIAL ? 'sequential' : 'standard'
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
});

// Handle graceful shutdown
function gracefulShutdown() {
  logger.info('Received shutdown signal, closing connections...');
=======
    status: 'ok'
  };
  
  logger.logResponse('/studio/status', response);
  res.status(200).json(response);
}) as express.RequestHandler);

// 추가 MCP 프로토콜 엔드포인트 - 클라이언트에서 도구 목록을 검색하는 데 사용
app.get('/tools', ((req, res) => {
  logger.logRequest('/tools', { query: req.query });
  
  const response = {
    tools: roblexTools.getToolList(),
    count: roblexTools.getToolCount()
  };
  
  logger.logResponse('/tools', response);
  res.status(200).json(response);
}) as express.RequestHandler);

// 정상 종료 처리
function gracefulShutdown(): void {
  logger.info('서버 종료 중...');
>>>>>>> Stashed changes
  
  // Disconnect all Studio adapters
  Object.values(studioAdapters).forEach(adapter => {
    try {
      adapter.disconnect();
    } catch (error) {
<<<<<<< Updated upstream
      logger.error('Error disconnecting adapter', { error });
    }
  });
  
  // Close the HTTP server
  httpServer.close(() => {
    logger.info('Server shutdown complete');
=======
      logger.error(`어댑터 연결 해제 오류: ${error}`);
    }
  });
  
  // MCP 서버 종료
  server.close().catch(error => {
    logger.error(`MCP 서버 종료 오류: ${error}`);
  });
  
  // HTTP 서버 종료
  httpServer.close(() => {
    logger.info('HTTP 서버 종료됨');
>>>>>>> Stashed changes
    process.exit(0);
  });
  
  // Force exit after timeout
  setTimeout(() => {
<<<<<<< Updated upstream
    logger.error('Forced exit after timeout');
=======
    logger.error('타임아웃 후 강제 종료');
>>>>>>> Stashed changes
    process.exit(1);
  }, 10000);
}

// Listen for shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

<<<<<<< Updated upstream
// Export the app and server for testing
export { app, server, httpServer };
=======
// 오류 처리 미들웨어 추가
app.use(errorHandlerMiddleware);

// 404 처리
app.use((req, res, next) => {
  logger.error(`경로를 찾을 수 없음: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route not found: ${req.method} ${req.path}`
  });
});

// 서버 시작
httpServer.listen(PORT, () => {
  logger.info(`MCP 서버가 포트 ${PORT}에서 수신 중`);
  logger.info(`서버 이름: ${SERVER_NAME}`);
  logger.info(`서버 버전: ${SERVER_VERSION}`);
  logger.info(`접속 URL: http://localhost:${PORT}`);
});
>>>>>>> Stashed changes
