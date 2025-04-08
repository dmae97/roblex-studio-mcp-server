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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const mcp_1 = require("@modelcontextprotocol/sdk/server/mcp");
const sse_js_1 = require("@modelcontextprotocol/sdk/server/sse.js");
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const logger_1 = require("./utils/logger");
const auth_1 = require("./utils/auth");
const errorHandler_1 = require("./utils/errorHandler");
const index_1 = require("./tools/index");
const index_2 = require("./resources/index");
const index_3 = require("./prompts/index");
const index_4 = require("./models/index");
const auth = __importStar(require("./utils/auth"));
// Load environment variables
dotenv_1.default.config();
// Initialize authentication system
auth.init();
// Server configuration
const PORT = Number(process.env.PORT || 3001);
const SERVER_NAME = process.env.SERVER_NAME || 'Roblex Studio MCP Server';
const SERVER_VERSION = process.env.SERVER_VERSION || '1.0.0';
const REQUIRE_AUTH = process.env.REQUIRE_AUTH === 'true';
// Create MCP Server
const server = new mcp_1.McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
    logger: logger_1.logger // Pass the custom logger
});
// Register tools, resources, and prompts
index_1.roblexTools.register(server);
index_2.roblexResources.register(server);
index_3.roblexPrompts.register(server);
// Create Express app
const app = (0, express_1.default)();
// Configure CORS
const corsOptions = {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
    credentials: true
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Create HTTP server from Express app
const httpServer = http_1.default.createServer(app);
// Storage for active transports
const transports = {};
// Storage for active Roblox Studio adapters
const studioAdapters = {};
// Authentication middleware for protected routes
const authMiddleware = REQUIRE_AUTH ? auth_1.apiKeyAuth : (req, res, next) => next();
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
    const sessionId = req.query.sessionId || req.cookies?.sessionId;
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
    const transport = new sse_js_1.SSEServerTransport('/messages', res);
    const sessionId = req.query.sessionId || transport.sessionId;
    transports[sessionId] = transport;
    // Create a new Roblox Studio adapter for this session
    const adapter = (0, index_4.roblexStudioAdapterFactory)(sessionId);
    studioAdapters[sessionId] = adapter;
    adapter.connect();
    // Register the session if it's not already registered
    if (!auth.isSessionValid(sessionId)) {
        const userId = req.apiKey?.name || 'anonymous';
        const role = req.apiKey?.role || 'user';
        auth.registerSession(sessionId, userId, role, req.ip || 'unknown');
    }
    else {
        auth.updateSessionActivity(sessionId);
    }
    logger_1.logger.info(`New SSE connection established: ${sessionId}`);
    res.on('close', () => {
        logger_1.logger.info(`SSE connection closed: ${sessionId}`);
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
    const sessionId = req.query.sessionId;
    const transport = transports[sessionId];
    if (transport) {
        // Update session activity
        auth.updateSessionActivity(sessionId);
        await transport.handlePostMessage(req, res);
    }
    else {
        logger_1.logger.error(`No transport found for sessionId: ${sessionId}`);
        res.status(400).send('No transport found for sessionId');
    }
});
// Studio API endpoint - For direct communication from Studio plugin
app.post('/studio/api', authMiddleware, async (req, res) => {
    const sessionId = req.query.sessionId;
    const adapter = studioAdapters[sessionId];
    if (!adapter) {
        logger_1.logger.error(`No Roblox Studio adapter found for sessionId: ${sessionId}`);
        res.status(400).json({ error: 'No active Roblox Studio session found' });
        return;
    }
    try {
        // Assuming the plugin sends messages in the format { messageType, data }
        const { messageType, data } = req.body;
        logger_1.logger.info(`Received studio message: ${messageType}`, { sessionId, data });
        // Let the adapter handle the message
        const result = await adapter.handleMessage(messageType, data);
        res.status(200).json(result);
    }
    catch (error) {
        logger_1.logger.error(`Error handling Roblox Studio message`, {
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
        globalModelCount: index_4.globalContext.getAllModels().length,
        // Cannot directly access private _handlers, so we'll omit this for now
        // handlers: Array.from(new Set(
        //   Object.values(studioAdapters).flatMap((adapter) => 
        //     Array.from(adapter.protocol._handlers.keys())
        //   )
        // ))
    });
});
// Secured API endpoints
const securedRouter = express_1.default.Router();
app.use('/api', authMiddleware, securedRouter);
// Get all sessions endpoint
securedRouter.get('/sessions', (req, res) => {
    // Only admin users can access this endpoint
    const userRole = req.apiKey?.role || req.user?.role;
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
    const model = index_4.globalContext.getModel(modelId);
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
logger_1.logger.info('WebSocket synchronization system was disabled to prevent port conflicts');
// Add 404 handler for non-existing routes
app.use((req, res, next) => {
    next(new errorHandler_1.NotFoundError(`Route not found: ${req.method} ${req.path}`));
});
// Add error handling middleware
app.use(errorHandler_1.errorHandlerMiddleware);
// Start the server
httpServer.listen(PORT, () => {
    logger_1.logger.info(`${SERVER_NAME} v${SERVER_VERSION} started on port ${PORT}`);
    logger_1.logger.info(`SSE endpoint: http://localhost:${PORT}/sse`);
    // WebSocket 동기화 엔드포인트 메시지 제거
    // logger.info(`WebSocket sync endpoint: ws://localhost:${PORT}/sync`);
});
// Graceful shutdown handler
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
// Uncaught exception handler
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught exception', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        error: error.toString()
    });
    gracefulShutdown(); // Attempt graceful shutdown on uncaught exception
});
function gracefulShutdown() {
    logger_1.logger.info('Graceful shutdown initiated...');
    // Close active connections
    Object.keys(studioAdapters).forEach(sessionId => {
        const adapter = studioAdapters[sessionId];
        if (adapter) {
            try {
                adapter.disconnect();
                logger_1.logger.info(`Disconnected Roblox Studio adapter: ${sessionId}`);
            }
            catch (error) {
                logger_1.logger.error(`Error disconnecting adapter ${sessionId}`, {
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }
    });
    // Close HTTP server
    httpServer.close(() => {
        logger_1.logger.info('HTTP server closed');
        // Additional cleanup if needed
        process.exit(0);
    });
    // Force exit after timeout
    setTimeout(() => {
        logger_1.logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
}
//# sourceMappingURL=index.js.map