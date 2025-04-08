"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSEServerTransport = void 0;
const uuid_1 = require("uuid");
const logger_js_1 = require("../utils/logger.js");
/**
 * Server-Sent Events (SSE) transport for MCP communication
 */
class SSEServerTransport {
    _sessionId;
    _path;
    _res;
    _messageHandler = null;
    _isConnected = false;
    /**
     * Create a new SSE transport
     * @param path URL path for the SSE endpoint
     * @param res Express response object
     */
    constructor(path, res) {
        this._sessionId = (0, uuid_1.v4)();
        this._path = path;
        this._res = res;
        // Configure response for SSE
        this._res.setHeader('Content-Type', 'text/event-stream');
        this._res.setHeader('Cache-Control', 'no-cache');
        this._res.setHeader('Connection', 'keep-alive');
        this._res.setHeader('X-Accel-Buffering', 'no'); // Prevents Nginx from buffering the SSE
        this._res.flushHeaders();
        this._isConnected = true;
        // Send initial connection success message
        this._sendEvent('connected', { sessionId: this._sessionId });
        logger_js_1.logger.info(`SSE transport created: ${this._sessionId}`);
        // Handle client disconnection
        this._res.on('close', () => {
            this._isConnected = false;
            logger_js_1.logger.info(`SSE client disconnected: ${this._sessionId}`);
        });
    }
    /**
     * Get the session ID
     */
    get sessionId() {
        return this._sessionId;
    }
    /**
     * Send a message through the SSE connection
     * @param message Message to send
     */
    async send(message) {
        if (!this._isConnected) {
            logger_js_1.logger.warn(`Attempted to send message to disconnected client: ${this._sessionId}`);
            return;
        }
        this._sendEvent('message', message);
    }
    /**
     * Handle POST messages from client
     * @param req Express request object
     * @param res Express response object
     */
    async handlePostMessage(req, res) {
        if (!this._messageHandler) {
            logger_js_1.logger.warn(`No message handler registered for SSE transport: ${this._sessionId}`);
            res.status(500).json({ error: 'Server not ready for messages' });
            return;
        }
        try {
            await this._messageHandler(req.body);
            res.status(200).json({ success: true });
        }
        catch (error) {
            logger_js_1.logger.error(`Error handling POST message: ${error instanceof Error ? error.message : String(error)}`);
            res.status(500).json({
                error: 'Failed to process message',
                details: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Set message handler for incoming messages
     * @param handler Message handler function
     */
    onMessage(handler) {
        this._messageHandler = handler;
    }
    /**
     * Send an SSE event
     * @param event Event name
     * @param data Event data
     */
    _sendEvent(event, data) {
        if (!this._isConnected) {
            return;
        }
        try {
            this._res.write(`event: ${event}\n`);
            this._res.write(`data: ${JSON.stringify(data)}\n\n`);
            // Express Response에는 flush 메서드가 없으므로 생략
            // Node.js의 기본 응답 처리가 데이터를 적절히 전송
        }
        catch (error) {
            logger_js_1.logger.error(`Error sending SSE event: ${error instanceof Error ? error.message : String(error)}`);
            this._isConnected = false;
        }
    }
    /**
     * Disconnect the transport
     */
    async disconnect() {
        if (!this._isConnected) {
            return;
        }
        try {
            // Send end event
            this._sendEvent('disconnected', { sessionId: this._sessionId });
            // End the response
            this._res.end();
            this._isConnected = false;
            logger_js_1.logger.info(`SSE transport disconnected: ${this._sessionId}`);
        }
        catch (error) {
            logger_js_1.logger.error(`Error disconnecting SSE transport: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.SSEServerTransport = SSEServerTransport;
//# sourceMappingURL=SSEServerTransport.js.map