import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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

// 서버 구현 가져오기
import { 
  McpServerFactory, 
  McpServer,
  SSEServerTransport,
  RoblexStudioService 
} from './server/index';

// 컴포넌트 내보내기
export * from './server/index';
export * from './models/index';

// 환경 변수 로드
dotenv.config();

// 인증 시스템 초기화
auth.init();

// 서버 설정
const PORT = process.env.PORT || 3002;
const SERVER_NAME = process.env.SERVER_NAME || 'Roblex Studio MCP Server';
const SERVER_VERSION = process.env.SERVER_VERSION || '1.0.0';
const REQUIRE_AUTH = process.env.REQUIRE_AUTH === 'true';

// MCP 서버 생성
const server = McpServerFactory.create({
  name: SERVER_NAME,
  version: SERVER_VERSION,
  logger
});

logger.info('MCP 서버 생성 완료');

// 도구, 리소스, 프롬프트 등록
roblexTools.register(server);
roblexResources.register(server);
roblexPrompts.register(server);

// Express 앱 생성
const app = express();

// CORS 설정
const corsOptions = {
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Express 앱에서 HTTP 서버 생성
const httpServer = http.createServer(app);

// 활성 트랜스포트 저장소
const transports: { [sessionId: string]: SSEServerTransport } = {};

// 활성 Roblox Studio 어댑터 저장소
const studioAdapters: { [sessionId: string]: ReturnType<typeof roblexStudioAdapterFactory> } = {};

// 인증 미들웨어
const authMiddleware = REQUIRE_AUTH ? apiKeyAuth : (req: express.Request, res: express.Response, next: express.NextFunction) => next();

// 로그인 엔드포인트
app.post('/auth/login', (async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  const { username, password, apiKey } = req.body;
  
  // API 키 인증 확인
  if (apiKey) {
    const result = auth.verifyApiKey(apiKey);
    
    if (!result.valid) {
      res.status(403).json({ error: 'Invalid API key' });
      return;
    }
    
    const sessionId = auth.generateSessionId('api');
    auth.registerSession(sessionId, result.name || 'api-user', result.role || 'user', req.ip || 'unknown');
    
    const token = auth.createToken({ 
      sessionId, 
      name: result.name, 
      role: result.role 
    });
    
    res.status(200).json({ 
      token,
      sessionId,
      user: { name: result.name, role: result.role }
    });
    return;
  }
  
  // 기본 사용자명/비밀번호 인증
  if (username === 'admin' && password === process.env.ADMIN_PASSWORD) {
    const sessionId = auth.generateSessionId('user');
    auth.registerSession(sessionId, username, 'admin', req.ip || 'unknown');
    
    const token = auth.createToken({ 
      sessionId, 
      username, 
      role: 'admin' 
    });
    
    // 세션 쿠키 설정
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: Number(process.env.SESSION_TIMEOUT || 3600) * 1000
    });
    
    res.status(200).json({ 
      token,
      sessionId,
      user: { username, role: 'admin' }
    });
    return;
  }
  
  res.status(401).json({ error: 'Invalid credentials' });
}) as express.RequestHandler);

// 로그아웃 엔드포인트
app.post('/auth/logout', ((req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const sessionId = req.query.sessionId as string || req.cookies?.sessionId;
  
  if (sessionId) {
    auth.revokeSession(sessionId);
    
    // 세션 쿠키 삭제
    res.clearCookie('sessionId');
    
    // 활성 어댑터 연결 해제
    if (studioAdapters[sessionId]) {
      studioAdapters[sessionId].disconnect();
      delete studioAdapters[sessionId];
    }
    
    res.status(200).json({ success: true });
    return;
  }
  
  res.status(400).json({ error: 'No active session' });
}) as express.RequestHandler);

// SSE 엔드포인트
app.get('/sse', authMiddleware, ((req: express.Request, res: express.Response, next: express.NextFunction): void => {
  // SSE 트랜스포트 생성
  const transport = new SSEServerTransport('/messages', res);
  const sessionId = req.query.sessionId as string || transport.sessionId;
  
  transports[sessionId] = transport;
  
  // 새 Roblox Studio 어댑터 생성
  const adapter = roblexStudioAdapterFactory(sessionId);
  studioAdapters[sessionId] = adapter;
  adapter.connect();
  
  // 세션이 등록되지 않은 경우 등록
  if (!auth.isSessionValid(sessionId)) {
    const userId = (req as any).apiKey?.name || 'anonymous';
    const role = (req as any).apiKey?.role || 'user';
    auth.registerSession(sessionId, userId, role, req.ip || 'unknown');
  } else {
    auth.updateSessionActivity(sessionId);
  }
  
  logger.info(`New SSE connection established: ${sessionId}`);
  
  // 연결 종료 감지
  res.on('close', () => {
    logger.info(`SSE connection closed: ${sessionId}`);
    delete transports[sessionId];
    
    if (studioAdapters[sessionId]) {
      studioAdapters[sessionId].disconnect();
      delete studioAdapters[sessionId];
    }
  });
  
  // MCP 서버에 트랜스포트 연결
  server.connect(transport).catch(error => {
    logger.error(`Error connecting transport to MCP server: ${error}`);
  });
}) as express.RequestHandler);

// 메시지 엔드포인트
app.post('/messages', authMiddleware, (async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  const sessionId = req.query.sessionId as string || req.body.sessionId;
  
  if (!sessionId) {
    res.status(400).json({ error: 'No session ID provided' });
    return;
  }
  
  const transport = transports[sessionId];
  
  if (!transport) {
    res.status(404).json({ error: 'Transport not found' });
    return;
  }
  
  try {
    const response = await transport.handlePostMessage(req);
    res.json(response);
  } catch (error: any) {
    logger.error(`Error handling message: ${error.message}`);
    res.status(500).json({ 
      error: 'Error handling message',
      message: error.message
    });
  }
}) as express.RequestHandler);

// 스튜디오 상태 엔드포인트
app.get('/studio/status', authMiddleware, (req, res) => {
  const activeAdapters = Object.values(studioAdapters).filter((adapter) => adapter.isConnected);
  
  res.status(200).json({
    activeConnections: activeAdapters.length,
    status: 'ok'
  });
});

// 정상 종료 처리
function gracefulShutdown(): void {
  logger.info('Shutting down server...');
  
  // 활성 어댑터 연결 해제
  Object.values(studioAdapters).forEach((adapter) => {
    try {
      adapter.disconnect();
    } catch (error) {
      logger.error(`Error disconnecting adapter: ${error}`);
    }
  });
  
  // MCP 서버 종료
  server.close().catch(error => {
    logger.error(`Error closing MCP server: ${error}`);
  });
  
  // HTTP 서버 종료
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  
  // 강제 종료 타임아웃
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

// 종료 신호 처리
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// 서버 시작
httpServer.listen(PORT, () => {
  logger.info(`MCP Server listening on port ${PORT}`);
  logger.info(`Server Name: ${SERVER_NAME}`);
  logger.info(`Server Version: ${SERVER_VERSION}`);
});
