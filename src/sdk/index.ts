/**
 * MCP(Model Context Protocol) SDK 구현
 * 원래 @modelcontextprotocol/sdk를 대체하는 간단한 구현
 */

// 기본 타입 정의
export type McpMessageHandler = (request: McpRequest) => Promise<McpResponse>;

// MCP 요청 타입
export enum McpRequestType {
  ToolCallRequest = 'tool_call_request',
  ErrorHandlingRequest = 'error_handling_request',
  CancellationRequest = 'cancellation_request'
}

// MCP 요청 인터페이스
export interface McpRequest {
  type: McpRequestType | string;
  toolCall?: {
    name: string;
    parameters: Record<string, any>;
  };
  [key: string]: any;
}

// MCP 응답 인터페이스
export interface McpResponse {
  type: 'success' | 'error' | string;
  result?: any;
  error?: {
    message: string;
    code: string;
  };
  [key: string]: any;
}

// MCP 트랜스포트 인터페이스
export interface McpTransport {
  sessionId: string;
  onMessage(handler: McpMessageHandler): void;
  close?(): Promise<void>;
}

// JSON 스키마
export interface Schema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  [key: string]: any;
}

// 도구 콜 핸들러
export type ToolCallHandler = (parameters: Record<string, any>) => Promise<any>;

// 실행 가능한 도구
export interface RunnableTool {
  name: string;
  schema: Schema;
  run: ToolCallHandler;
}

// MCP 레지스트리
export interface McpRegistry {
  registerTool(name: string, schema: Schema): void;
  getTool(name: string): Schema | undefined;
  getAllTools(): Record<string, Schema>;
}

// 로거 인터페이스
export interface Logger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

// 기본 레지스트리 구현
export class DefaultRegistry implements McpRegistry {
  private tools: Record<string, Schema> = {};

  constructor() {}

  registerTool(name: string, schema: Schema): void {
    this.tools[name] = schema;
  }

  getTool(name: string): Schema | undefined {
    return this.tools[name];
  }

  getAllTools(): Record<string, Schema> {
    return { ...this.tools };
  }
}
