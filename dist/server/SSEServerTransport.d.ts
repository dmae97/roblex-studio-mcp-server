import { Response } from 'express';
import { McpMessageHandler, McpTransport, McpResponse } from '../sdk';
/**
 * SSE(Server-Sent Events) 서버 트랜스포트
 * MCP 프로토콜을 위한 트랜스포트 구현
 */
export declare class SSEServerTransport implements McpTransport {
    sessionId: string;
    private response;
    private endpoint;
    private messageHandler;
    private closed;
    /**
     * SSE 트랜스포트 생성
     * @param endpoint API 엔드포인트 경로
     * @param response Express 응답 객체
     */
    constructor(endpoint: string, response: Response);
    /**
     * 메시지 핸들러 설정
     * MCP 요청을 처리하고 응답을 반환하는 함수 등록
     */
    onMessage(handler: McpMessageHandler): void;
    /**
     * MCP 요청 처리
     * API 엔드포인트로 들어온 POST 요청 처리
     */
    handlePostMessage(req: any): Promise<McpResponse>;
    /**
     * SSE 이벤트 전송
     */
    private sendEvent;
    /**
     * 연결 유지를 위한 핑 설정
     */
    private setupKeepAlive;
    /**
     * 트랜스포트 종료
     */
    close(): Promise<void>;
}
