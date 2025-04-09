"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoblexStudioService = void 0;
const express_1 = __importDefault(require("express"));
const SSEServerTransport_js_1 = require("./SSEServerTransport.js");
const McpServerFactory_js_1 = require("./McpServerFactory.js");
const logger_js_1 = require("../utils/logger.js");
const uuid_1 = require("uuid");
/**
 * Roblox Studio Service
 * Manages MCP server, endpoints, and connections for Roblox Studio
 */
class RoblexStudioService {
    _name = 'RoblexStudioMCP';
    _version;
    _apiPrefix;
    _concurrency;
    _server;
    _router;
    _transports = new Map();
    /**
     * Create a new Roblox Studio service
     * @param options Service options
     */
    constructor(options) {
        this._version = options.version;
        this._apiPrefix = options.apiPrefix || '/api/roblox-studio';
        this._concurrency = options.concurrency || 1;
        // Create the sequential MCP server
        this._server = McpServerFactory_js_1.McpServerFactory.createSequential({
            name: this._name,
            version: this._version,
            logger: logger_js_1.logger
        }, this._concurrency);
        // Create Express router
        this._router = express_1.default.Router();
        this._setupRoutes();
        logger_js_1.logger.info(`RoblexStudioService created: v${this._version}, concurrency: ${this._concurrency}`);
    }
    /**
     * Get the Express router
     */
    get router() {
        return this._router;
    }
    /**
     * Setup Express routes
     */
    _setupRoutes() {
        // SSE endpoint for event streaming
        this._router.get(`${this._apiPrefix}/events`, (req, res) => {
            this._handleSSEConnection(req, res);
        });
        // POST endpoint for sending messages to the server
        this._router.post(`${this._apiPrefix}/messages/:sessionId`, express_1.default.json(), (req, res) => {
            this._handleMessage(req, res);
        });
        // Disconnect endpoint
        this._router.post(`${this._apiPrefix}/disconnect/:sessionId`, (req, res) => {
            this._handleDisconnect(req, res);
        });
        // Health check endpoint
        this._router.get(`${this._apiPrefix}/health`, (req, res) => {
            res.json({
                status: 'ok',
                version: this._version,
                name: this._name,
                connections: this._transports.size
            });
        });
        logger_js_1.logger.info(`RoblexStudioService routes setup on prefix: ${this._apiPrefix}`);
    }
    /**
     * Handle SSE connection
     * @param req Express request
     * @param res Express response
     */
    _handleSSEConnection(req, res) {
        const sessionId = (0, uuid_1.v4)();
        const path = `${this._apiPrefix}/events`;
        logger_js_1.logger.info(`New SSE connection: ${sessionId}`);
        // Create SSE transport
        const transport = new SSEServerTransport_js_1.SSEServerTransport(path, res);
        this._transports.set(sessionId, transport);
        // Connect to MCP server
        this._server.connect(transport).catch(error => {
            logger_js_1.logger.error(`Error connecting transport: ${error instanceof Error ? error.message : String(error)}`);
        });
        // Handle client disconnection
        res.on('close', () => {
            this._handleSSEDisconnection(sessionId);
        });
    }
    /**
     * Handle SSE disconnection
     * @param sessionId Session ID to disconnect
     */
    _handleSSEDisconnection(sessionId) {
        logger_js_1.logger.info(`SSE disconnection: ${sessionId}`);
        // Disconnect from MCP server
        this._server.disconnect(sessionId).catch(error => {
            logger_js_1.logger.error(`Error disconnecting transport: ${error instanceof Error ? error.message : String(error)}`);
        });
        // Remove from transports map
        this._transports.delete(sessionId);
    }
    /**
     * Handle message from client
     * @param req Express request
     * @param res Express response
     */
    _handleMessage(req, res) {
        const sessionId = req.params.sessionId;
        const transport = this._transports.get(sessionId);
        if (!transport) {
            logger_js_1.logger.warn(`Message received for unknown session: ${sessionId}`);
            res.status(404).json({ error: 'Session not found' });
            return;
        }
        // Pass to transport for handling
        transport.handlePostMessage(req, res).catch(error => {
            logger_js_1.logger.error(`Error handling message: ${error instanceof Error ? error.message : String(error)}`);
            res.status(500).json({ error: 'Server error' });
        });
    }
    /**
     * Handle explicit disconnect request
     * @param req Express request
     * @param res Express response
     */
    _handleDisconnect(req, res) {
        const sessionId = req.params.sessionId;
        this._handleSSEDisconnection(sessionId);
        res.json({ success: true, message: 'Disconnected' });
    }
    /**
     * Get the MCP server
     */
    get server() {
        return this._server;
    }
    /**
     * Shutdown the service
     */
    async shutdown() {
        logger_js_1.logger.info('Shutting down RoblexStudioService');
        // Disconnect all transports
        await this._server.disconnectAll();
        // Clear transports map
        this._transports.clear();
        logger_js_1.logger.info('RoblexStudioService shutdown complete');
    }
}
exports.RoblexStudioService = RoblexStudioService;
//# sourceMappingURL=RoblexStudioService.js.map