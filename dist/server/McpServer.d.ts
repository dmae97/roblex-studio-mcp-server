import { Logger, McpTransport, RunnableTool, ToolCallHandler, Schema } from '../sdk';
/**
 * McpServer 옵션 인터페이스
 */
export interface McpServerOptions {
    name: string;
    version: string;
    logger?: Logger;
}
/**
 * Roblex Studio MCP Server 구현
 */
export declare class McpServer {
    private options;
    private registry;
    private transports;
    private toolHandlers;
    constructor(options: McpServerOptions);
    /**
     * 트랜스포트를 서버에 연결합니다
     */
    connect(transport: McpTransport): Promise<void>;
    /**
     * MCP 요청을 처리합니다
     */
    private handleRequest;
    /**
     * 도구 호출 요청을 처리합니다
     */
    private handleToolCallRequest;
    /**
     * 서버에 도구를 등록합니다
     */
    tool(name: string, schema: Schema, handler: ToolCallHandler): RunnableTool;
    /**
     * 모든 연결된 트랜스포트를 닫습니다
     */
    close(): Promise<void>;
}
