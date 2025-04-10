"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSEServerTransport = void 0;
const uuid_1 = require("uuid");
const logger_1 = require("../utils/logger");
/**
 * SSE(Server-Sent Events) 서버 트랜스포트
 * MCP 프로토콜을 위한 트랜스포트 구현
 */
class SSEServerTransport {
    sessionId;
    response;
    endpoint;
    messageHandler = null;
    closed = false;
    /**
     * SSE 트랜스포트 생성
     * @param endpoint API 엔드포인트 경로
     * @param response Express 응답 객체
     */
    constructor(endpoint, response) {
        this.sessionId = (0, uuid_1.v4)();
        this.response = response;
        this.endpoint = endpoint;
        // SSE 헤더 설정
        this.response.setHeader('Content-Type', 'text/event-stream');
        this.response.setHeader('Cache-Control', 'no-cache');
        this.response.setHeader('Connection', 'keep-alive');
        // 연결 유지를 위한 정기적인 핑 설정
        this.setupKeepAlive();
        // 연결 종료 감지
        this.response.on('close', () => {
            this.closed = true;
            logger_1.logger.info(`SSE connection closed: ${this.sessionId}`);
        });
        logger_1.logger.info(`Created SSE transport for endpoint: ${endpoint}, sessionId: ${this.sessionId}`);
    }
    /**
     * 메시지 핸들러 설정
     * MCP 요청을 처리하고 응답을 반환하는 함수 등록
     */
    onMessage(handler) {
        this.messageHandler = handler;
    }
    /**
     * MCP 요청 처리
     * API 엔드포인트로 들어온 POST 요청 처리
     */
    async handlePostMessage(req) {
        if (this.closed) {
            throw new Error('Transport is closed');
        }
        if (!this.messageHandler) {
            throw new Error('No message handler registered');
        }
        const request = req.body;
        logger_1.logger.info(`Received message on ${this.endpoint}: ${JSON.stringify(request)}`);
        try {
            const response = await this.messageHandler(request);
            this.sendEvent('message', response);
            return response;
        }
        catch (error) {
            const errorResponse = {
                type: 'error',
                error: {
                    message: error.message || 'Unknown error',
                    code: 'INTERNAL_SERVER_ERROR'
                }
            };
            this.sendEvent('error', errorResponse);
            return errorResponse;
        }
    }
    /**
     * SSE 이벤트 전송
     */
    sendEvent(event, data) {
        if (this.closed) {
            logger_1.logger.warn(`Attempted to send event to closed transport: ${this.sessionId}`);
            return;
        }
        try {
            this.response.write(`event: ${event}\n`);
            this.response.write(`data: ${JSON.stringify(data)}\n\n`);
            // Express의 Response 객체에는 flush 메서드가 없으므로 제거
            // 필요한 경우 다음과 같이 처리할 수 있음: (this.response as any).flush?.()
        }
        catch (error) {
            logger_1.logger.error(`Error sending SSE event: ${error}`);
        }
    }
    /**
     * 연결 유지를 위한 핑 설정
     */
    setupKeepAlive() {
        const interval = setInterval(() => {
            if (this.closed) {
                clearInterval(interval);
                return;
            }
            try {
                this.response.write(': ping\n\n');
                // Express의 Response 객체에는 flush 메서드가 없으므로 제거
            }
            catch (error) {
                logger_1.logger.error(`Error sending keep-alive ping: ${error}`);
                clearInterval(interval);
                this.closed = true;
            }
        }, 30000); // 30초마다 핑 전송
    }
    /**
     * 트랜스포트 종료
     */
    async close() {
        if (!this.closed) {
            try {
                this.response.end();
            }
            catch (error) {
                logger_1.logger.error(`Error closing SSE response: ${error}`);
            }
            this.closed = true;
        }
    }
}
exports.SSEServerTransport = SSEServerTransport;
//# sourceMappingURL=SSEServerTransport.js.map