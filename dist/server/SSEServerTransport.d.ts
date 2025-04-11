<<<<<<< Updated upstream
/// <reference types="cookie-parser" />
import { Transport } from './McpServer.js';
import { Response, Request } from 'express';
/**
 * Server-Sent Events (SSE) transport for MCP communication
 */
export declare class SSEServerTransport implements Transport {
    private _sessionId;
    private _path;
    private _res;
    private _messageHandler;
    private _isConnected;
    /**
     * Create a new SSE transport
     * @param path URL path for the SSE endpoint
     * @param res Express response object
     */
    constructor(path: string, res: Response);
    /**
     * Get the session ID
=======
import { Response, Request } from 'express';
import { McpResponse, McpMessageHandler, McpTransport } from '../sdk';
/**
 * Server-Sent Events 트랜스포트 구현
 * Claude Desktop와의 실시간 통신을 위해 SSE 프로토콜 사용
 */
export declare class SSEServerTransport implements McpTransport {
    private res;
    private messageHandler;
    private isAlive;
    private endpoint;
    private keepAliveInterval;
    /** 세션 ID */
    readonly sessionId: string;
    /**
     * SSE 트랜스포트 생성자
     * @param endpoint API 엔드포인트 경로
     * @param res Express 응답 객체
     */
    constructor(endpoint: string, res: Response);
    /**
     * 메시지 핸들러 설정
     * @param handler 메시지 처리 핸들러 함수
>>>>>>> Stashed changes
     */
    get sessionId(): string;
    /**
<<<<<<< Updated upstream
     * Send a message through the SSE connection
     * @param message Message to send
     */
    send(message: any): Promise<void>;
    /**
     * Handle POST messages from client
     * @param req Express request object
     * @param res Express response object
     */
    handlePostMessage(req: Request, res: Response): Promise<void>;
    /**
     * Set message handler for incoming messages
     * @param handler Message handler function
     */
    onMessage(handler: (message: any) => Promise<void>): void;
    /**
     * Send an SSE event
     * @param event Event name
     * @param data Event data
     */
    private _sendEvent;
    /**
     * Disconnect the transport
     */
    disconnect(): Promise<void>;
=======
     * 메시지 전송
     * @param message 전송할 메시지
     */
    send(message: McpResponse): Promise<void>;
    /**
     * POST 메시지 처리
     * @param req Express 요청 객체
     * @returns 응답 객체
     */
    handlePostMessage(req: Request): Promise<McpResponse>;
    /**
     * 트랜스포트 연결 종료
     */
    close(): Promise<void>;
    /**
     * Keep-alive 메시지 전송 시작
     * @private
     */
    private startKeepAlive;
    /**
     * Keep-alive 메시지 전송 중지
     * @private
     */
    private stopKeepAlive;
>>>>>>> Stashed changes
}
