/**
 * MCP(Model Context Protocol) SDK 구현
 * 원래 @modelcontextprotocol/sdk를 대체하는 간단한 구현
 */
export type McpMessageHandler = (request: McpRequest) => Promise<McpResponse>;
export declare enum McpRequestType {
    ToolCallRequest = "tool_call_request",
    ResourceRequest = "resource_request",
    PromptRequest = "prompt_request",
    ContextRequest = "context_request",
    HistoryRequest = "history_request",
    ErrorHandlingRequest = "error_handling_request",
    CancellationRequest = "cancellation_request"
}
export declare enum McpResponseType {
    ToolCallResponse = "tool_call_response",
    ResourceResponse = "resource_response",
    PromptResponse = "prompt_response",
    ContextResponse = "context_response",
    HistoryResponse = "history_response",
    Error = "error",
    Success = "success"
}
export interface McpToolDefinition {
    name: string;
    description: string;
    parameters: any;
    handler: (params: any, context?: any) => Promise<any>;
}
export interface McpResourceDefinition {
    name: string;
    description: string;
    handler: (params: any, context?: any) => Promise<any>;
}
export interface McpPromptDefinition {
    name: string;
    description: string;
    handler: (params: any, context?: any) => Promise<string>;
}
export interface McpError {
    message: string;
    code: string;
    details?: any;
}
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
export interface McpToolCallRequest extends McpRequest {
    type: McpRequestType.ToolCallRequest;
    name: string;
    params: any;
}
export interface McpToolCallResponse extends McpResponse {
    type: McpResponseType.ToolCallResponse;
    result: any;
}
export interface McpResourceRequest extends McpRequest {
    type: McpRequestType.ResourceRequest;
    name: string;
    params: any;
}
export interface McpResourceResponse extends McpResponse {
    type: McpResponseType.ResourceResponse;
    result: any;
}
export interface McpPromptRequest extends McpRequest {
    type: McpRequestType.PromptRequest;
    name: string;
    params: any;
}
export interface McpPromptResponse extends McpResponse {
    type: McpResponseType.PromptResponse;
    result: string;
}
export interface McpErrorResponse extends McpResponse {
    type: McpResponseType.Error;
    error: McpError;
}
export interface McpTransport {
    sessionId?: string;
    onMessage: (handler: (message: McpRequest) => Promise<McpResponse>) => void;
    send: (message: McpResponse) => Promise<void>;
    close: () => Promise<void>;
}
export type McpToolHandler = (params: any, context?: any) => Promise<any>;
export type McpResourceHandler = (params: any, context?: any) => Promise<any>;
export type McpPromptHandler = (params: any, context?: any) => Promise<string>;
export interface McpServerOptions {
    name: string;
    version: string;
    logger?: any;
}
export interface Schema {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
    [key: string]: any;
}
export type ToolCallHandler = (parameters: Record<string, any>) => Promise<any>;
export interface RunnableTool {
    name: string;
    schema: Schema;
    run: ToolCallHandler;
}
export interface McpRegistry {
    registerTool(name: string, schema: Schema): void;
    getTool(name: string): Schema | undefined;
    getAllTools(): Record<string, Schema>;
}
export interface Logger {
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}
export declare class DefaultRegistry implements McpRegistry {
    private tools;
    constructor();
    registerTool(name: string, schema: Schema): void;
    getTool(name: string): Schema | undefined;
    getAllTools(): Record<string, Schema>;
}
