"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSEServerTransport = void 0;
const uuid_1 = require("uuid");
const logger_js_1 = require("../utils/logger.js");
/**
<<<<<<< Updated upstream
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
=======
 * Server-Sent Events 트랜스포트 구현
 * Claude Desktop와의 실시간 통신을 위해 SSE 프로토콜 사용
 */
class SSEServerTransport {
    res;
    messageHandler = null;
    isAlive = true;
    endpoint;
    keepAliveInterval = null;
    /** 세션 ID */
    sessionId;
    /**
     * SSE 트랜스포트 생성자
     * @param endpoint API 엔드포인트 경로
     * @param res Express 응답 객체
     */
    constructor(endpoint, res) {
        this.endpoint = endpoint;
        this.res = res;
        this.sessionId = (0, uuid_1.v4)();
        // SSE 헤더 설정
        this.res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
        });
        // 연결 시작 메시지 전송
        this.res.write(`data: ${JSON.stringify({ type: 'connection', sessionId: this.sessionId })}\n\n`);
        // 연결 종료 감지
        this.res.on('close', () => {
            this.isAlive = false;
            this.stopKeepAlive();
            logger_1.logger.info(`SSE 연결 종료: ${this.sessionId}`);
        });
        // 2초마다 keep-alive 메시지 전송
        this.startKeepAlive();
        logger_1.logger.info(`새 SSE 트랜스포트 생성: ${this.sessionId}`);
    }
    /**
     * 메시지 핸들러 설정
     * @param handler 메시지 처리 핸들러 함수
     */
    onMessage(handler) {
        this.messageHandler = handler;
        logger_1.logger.debug(`메시지 핸들러 설정됨: ${this.sessionId}`);
    }
    /**
     * 메시지 전송
     * @param message 전송할 메시지
     */
    async send(message) {
        if (!this.isAlive) {
            logger_1.logger.warn(`연결이 종료된 클라이언트에 메시지 전송 시도: ${this.sessionId}`);
            return;
        }
        try {
            const jsonMessage = JSON.stringify(message);
            logger_1.logger.debug(`메시지 전송 중: ${jsonMessage.substring(0, 200)}${jsonMessage.length > 200 ? '...' : ''}`);
            this.res.write(`data: ${jsonMessage}\n\n`);
        }
        catch (error) {
            logger_1.logger.error(`메시지 전송 오류: ${error}`);
            throw error;
        }
    }
    /**
     * POST 메시지 처리
     * @param req Express 요청 객체
     * @returns 응답 객체
     */
    async handlePostMessage(req) {
        if (!this.messageHandler) {
            logger_1.logger.error('메시지 핸들러가 설정되지 않음');
            return {
                type: 'error',
                error: {
                    message: 'No message handler set',
                    code: 'NO_HANDLER_ERROR'
                }
            };
        }
        if (!this.isAlive) {
            logger_1.logger.error('연결이 종료됨');
            return {
                type: 'error',
                error: {
                    message: 'Connection closed',
                    code: 'CONNECTION_CLOSED'
                }
            };
        }
        try {
            const requestBody = req.body;
            logger_1.logger.debug(`POST 메시지 수신: ${JSON.stringify(requestBody).substring(0, 200)}${JSON.stringify(requestBody).length > 200 ? '...' : ''}`);
            // 트랜스포트 세션 ID 주입
            if (!requestBody.sessionId) {
                requestBody.sessionId = this.sessionId;
            }
            // 요청 처리
            const response = await this.messageHandler(requestBody);
            // 응답 세션 ID 추가
            if (!response.sessionId) {
                response.sessionId = this.sessionId;
            }
            logger_1.logger.debug(`응답 준비: ${JSON.stringify(response).substring(0, 200)}${JSON.stringify(response).length > 200 ? '...' : ''}`);
            return response;
        }
        catch (error) {
            logger_1.logger.error(`메시지 처리 오류: ${error.message}`);
            return {
                type: 'error',
                sessionId: this.sessionId,
                error: {
                    message: `Error handling message: ${error.message}`,
                    code: 'MESSAGE_PROCESSING_ERROR'
                }
            };
        }
    }
    /**
     * 트랜스포트 연결 종료
     */
    async close() {
        if (!this.isAlive) {
            return;
        }
        this.isAlive = false;
        this.stopKeepAlive();
        try {
            this.res.write(`data: ${JSON.stringify({ type: 'close', sessionId: this.sessionId })}\n\n`);
            this.res.end();
            logger_1.logger.info(`트랜스포트 연결 종료됨: ${this.sessionId}`);
        }
        catch (error) {
            logger_1.logger.error(`연결 종료 오류: ${error}`);
        }
    }
    /**
     * Keep-alive 메시지 전송 시작
     * @private
     */
    startKeepAlive() {
        this.keepAliveInterval = setInterval(() => {
            if (this.isAlive) {
                try {
                    this.res.write(': keep-alive\n\n');
                }
                catch (error) {
                    logger_1.logger.error(`Keep-alive 메시지 전송 오류: ${error}`);
                    this.stopKeepAlive();
                    this.isAlive = false;
                }
            }
            else {
                this.stopKeepAlive();
            }
        }, 2000);
    }
    /**
     * Keep-alive 메시지 전송 중지
     * @private
     */
    stopKeepAlive() {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
            this.keepAliveInterval = null;
>>>>>>> Stashed changes
        }
    }
}
exports.SSEServerTransport = SSEServerTransport;
//# sourceMappingURL=SSEServerTransport.js.map