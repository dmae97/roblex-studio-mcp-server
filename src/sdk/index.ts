/**
 * MCP(Model Context Protocol) SDK 구현
 * 원래 @modelcontextprotocol/sdk를 대체하는 간단한 구현
 */

// 기본 타입 정의
export type McpMessageHandler = (request: McpRequest) => Promise<McpResponse>;

// MCP 요청 타입 열거형
export enum McpRequestType {
  ToolCallRequest = 'tool_call_request',
  ResourceRequest = 'resource_request',
  PromptRequest = 'prompt_request',
  ContextRequest = 'context_request',
  HistoryRequest = 'history_request',
  ErrorHandlingRequest = 'error_handling_request',
  CancellationRequest = 'cancellation_request'
}

// MCP 응답 타입 열거형
export enum McpResponseType {
  ToolCallResponse = 'tool_call_response',
  ResourceResponse = 'resource_response',
  PromptResponse = 'prompt_response',
  ContextResponse = 'context_response',
  HistoryResponse = 'history_response',
  Error = 'error',
  Success = 'success'
}

// MCP 도구 정의 인터페이스
export interface McpToolDefinition {
  name: string;
  description: string;
  parameters: any;
  handler: (params: any, context?: any) => Promise<any>;
}

// MCP 리소스 정의 인터페이스
export interface McpResourceDefinition {
  name: string;
  description: string;
  handler: (params: any, context?: any) => Promise<any>;
}

// MCP 프롬프트 정의 인터페이스
export interface McpPromptDefinition {
  name: string;
  description: string;
  handler: (params: any, context?: any) => Promise<string>;
}

// 오류 인터페이스
export interface McpError {
  message: string;
  code: string; 
  details?: any;
}

// MCP 요청 인터페이스
export interface McpRequest {
  type: McpRequestType | string;
  id?: string;
  sessionId?: string;
  timestamp?: number;
  toolCall?: {
    name: string;
    parameters: Record<string, any>;
  };
  [key: string]: any;
}

// MCP 응답 인터페이스
export interface McpResponse {
  type: McpResponseType | string;
  id?: string;
  requestId?: string;
  sessionId?: string;
  timestamp?: number;
  error?: McpError; 
  result?: any;
  [key: string]: any;
}

// 도구 호출 요청 인터페이스
export interface McpToolCallRequest extends McpRequest {
  type: McpRequestType.ToolCallRequest;
  name: string;
  params: any;
}

// 도구 호출 응답 인터페이스
export interface McpToolCallResponse extends McpResponse {
  type: McpResponseType.ToolCallResponse;
  result: any;
}

// 리소스 요청 인터페이스
export interface McpResourceRequest extends McpRequest {
  type: McpRequestType.ResourceRequest;
  name: string;
  params: any;
}

// 리소스 응답 인터페이스
export interface McpResourceResponse extends McpResponse {
  type: McpResponseType.ResourceResponse;
  result: any;
}

// 프롬프트 요청 인터페이스
export interface McpPromptRequest extends McpRequest {
  type: McpRequestType.PromptRequest;
  name: string;
  params: any;
}

// 프롬프트 응답 인터페이스
export interface McpPromptResponse extends McpResponse {
  type: McpResponseType.PromptResponse;
  result: string;
}

// 오류 응답 인터페이스
export interface McpErrorResponse extends McpResponse {
  type: McpResponseType.Error;
  error: McpError; 
}

// MCP 전송 인터페이스
export interface McpTransport {
  sessionId?: string;
  onMessage: (handler: (message: McpRequest) => Promise<McpResponse>) => void;
  send: (message: McpResponse) => Promise<void>;
  close: () => Promise<void>;
}

// 도구 핸들러 타입
export type McpToolHandler = (params: any, context?: any) => Promise<any>;

// 리소스 핸들러 타입
export type McpResourceHandler = (params: any, context?: any) => Promise<any>;

// 프롬프트 핸들러 타입
export type McpPromptHandler = (params: any, context?: any) => Promise<string>;

// MCP 서버 옵션 인터페이스
export interface McpServerOptions {
  name: string;
  version: string;
  logger?: any;
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
