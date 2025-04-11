"use strict";
/**
 * MCP(Model Context Protocol) SDK 구현
 * 원래 @modelcontextprotocol/sdk를 대체하는 간단한 구현
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultRegistry = exports.McpResponseType = exports.McpRequestType = void 0;
// MCP 요청 타입 열거형
var McpRequestType;
(function (McpRequestType) {
    McpRequestType["ToolCallRequest"] = "tool_call_request";
    McpRequestType["ResourceRequest"] = "resource_request";
    McpRequestType["PromptRequest"] = "prompt_request";
    McpRequestType["ContextRequest"] = "context_request";
    McpRequestType["HistoryRequest"] = "history_request";
    McpRequestType["ErrorHandlingRequest"] = "error_handling_request";
    McpRequestType["CancellationRequest"] = "cancellation_request";
})(McpRequestType || (exports.McpRequestType = McpRequestType = {}));
// MCP 응답 타입 열거형
var McpResponseType;
(function (McpResponseType) {
    McpResponseType["ToolCallResponse"] = "tool_call_response";
    McpResponseType["ResourceResponse"] = "resource_response";
    McpResponseType["PromptResponse"] = "prompt_response";
    McpResponseType["ContextResponse"] = "context_response";
    McpResponseType["HistoryResponse"] = "history_response";
    McpResponseType["Error"] = "error";
    McpResponseType["Success"] = "success";
})(McpResponseType || (exports.McpResponseType = McpResponseType = {}));
// 기본 레지스트리 구현
class DefaultRegistry {
    tools = {};
    constructor() { }
    registerTool(name, schema) {
        this.tools[name] = schema;
    }
    getTool(name) {
        return this.tools[name];
    }
    getAllTools() {
        return { ...this.tools };
    }
}
exports.DefaultRegistry = DefaultRegistry;
//# sourceMappingURL=index.js.map