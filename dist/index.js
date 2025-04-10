"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const logger_1 = require("./utils/logger");
const auth_1 = require("./utils/auth");
const index_1 = require("./tools/index");
const index_2 = require("./resources/index");
const index_3 = require("./prompts/index");
const index_4 = require("./models/index");
const auth = __importStar(require("./utils/auth"));
// 서버 구현 가져오기
const index_5 = require("./server/index");
// 컴포넌트 내보내기
__exportStar(require("./server/index"), exports);
__exportStar(require("./models/index"), exports);
// 환경 변수 로드
dotenv_1.default.config();
// 인증 시스템 초기화
auth.init();
// 서버 설정
const PORT = process.env.PORT || 3002;
const SERVER_NAME = process.env.SERVER_NAME || 'Roblex Studio MCP Server';
const SERVER_VERSION = process.env.SERVER_VERSION || '1.0.0';
const REQUIRE_AUTH = process.env.REQUIRE_AUTH === 'true';
// MCP 서버 생성
const server = index_5.McpServerFactory.create({
    name: SERVER_NAME,
    version: SERVER_VERSION,
    logger: logger_1.logger
});
logger_1.logger.info('MCP 서버 생성 완료');
// 도구, 리소스, 프롬프트 등록
index_1.roblexTools.register(server);
index_2.roblexResources.register(server);
index_3.roblexPrompts.register(server);
// Express 앱 생성
const app = (0, express_1.default)();
// CORS 설정
const corsOptions = {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
    credentials: true
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Express 앱에서 HTTP 서버 생성
const httpServer = http_1.default.createServer(app);
// 활성 트랜스포트 저장소
const transports = {};
// 활성 Roblox Studio 어댑터 저장소
const studioAdapters = {};
// 인증 미들웨어
const authMiddleware = REQUIRE_AUTH ? auth_1.apiKeyAuth : (req, res, next) => next();
// 로그인 엔드포인트
app.post('/auth/login', (async (req, res, next) => {
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
}));
// 로그아웃 엔드포인트
app.post('/auth/logout', ((req, res, next) => {
    const sessionId = req.query.sessionId || req.cookies?.sessionId;
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
}));
// SSE 엔드포인트
app.get('/sse', authMiddleware, ((req, res, next) => {
    // SSE 트랜스포트 생성
    const transport = new index_5.SSEServerTransport('/messages', res);
    const sessionId = req.query.sessionId || transport.sessionId;
    transports[sessionId] = transport;
    // 새 Roblox Studio 어댑터 생성
    const adapter = (0, index_4.roblexStudioAdapterFactory)(sessionId);
    studioAdapters[sessionId] = adapter;
    adapter.connect();
    // 세션이 등록되지 않은 경우 등록
    if (!auth.isSessionValid(sessionId)) {
        const userId = req.apiKey?.name || 'anonymous';
        const role = req.apiKey?.role || 'user';
        auth.registerSession(sessionId, userId, role, req.ip || 'unknown');
    }
    else {
        auth.updateSessionActivity(sessionId);
    }
    logger_1.logger.info(`New SSE connection established: ${sessionId}`);
    // 연결 종료 감지
    res.on('close', () => {
        logger_1.logger.info(`SSE connection closed: ${sessionId}`);
        delete transports[sessionId];
        if (studioAdapters[sessionId]) {
            studioAdapters[sessionId].disconnect();
            delete studioAdapters[sessionId];
        }
    });
    // MCP 서버에 트랜스포트 연결
    server.connect(transport).catch(error => {
        logger_1.logger.error(`Error connecting transport to MCP server: ${error}`);
    });
}));
// 메시지 엔드포인트
app.post('/messages', authMiddleware, (async (req, res, next) => {
    const sessionId = req.query.sessionId || req.body.sessionId;
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
    }
    catch (error) {
        logger_1.logger.error(`Error handling message: ${error.message}`);
        res.status(500).json({
            error: 'Error handling message',
            message: error.message
        });
    }
}));
// 스튜디오 상태 엔드포인트
app.get('/studio/status', authMiddleware, (req, res) => {
    const activeAdapters = Object.values(studioAdapters).filter((adapter) => adapter.isConnected);
    res.status(200).json({
        activeConnections: activeAdapters.length,
        status: 'ok'
    });
});
// 정상 종료 처리
function gracefulShutdown() {
    logger_1.logger.info('Shutting down server...');
    // 활성 어댑터 연결 해제
    Object.values(studioAdapters).forEach((adapter) => {
        try {
            adapter.disconnect();
        }
        catch (error) {
            logger_1.logger.error(`Error disconnecting adapter: ${error}`);
        }
    });
    // MCP 서버 종료
    server.close().catch(error => {
        logger_1.logger.error(`Error closing MCP server: ${error}`);
    });
    // HTTP 서버 종료
    httpServer.close(() => {
        logger_1.logger.info('HTTP server closed');
        process.exit(0);
    });
    // 강제 종료 타임아웃
    setTimeout(() => {
        logger_1.logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
}
// 종료 신호 처리
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
// 서버 시작
httpServer.listen(PORT, () => {
    logger_1.logger.info(`MCP Server listening on port ${PORT}`);
    logger_1.logger.info(`Server Name: ${SERVER_NAME}`);
    logger_1.logger.info(`Server Version: ${SERVER_VERSION}`);
});
//# sourceMappingURL=index.js.map