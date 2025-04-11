<<<<<<< Updated upstream
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Registry for all Roblex Studio tools
 */
export declare const roblexTools: {
    register: (server: McpServer) => void;
=======
import { McpServer } from '../server/McpServer';
interface ToolDefinition {
    name: string;
    description: string;
    parameters: any;
    handler: (params: any, context?: any) => Promise<any>;
}
export declare const roblexTools: {
    /**
     * 서버에 도구 등록
     * @param server MCP 서버 인스턴스
     */
    register: (server: McpServer) => void;
    /**
     * 등록된 도구 목록 가져오기
     * @returns 도구 정의 목록
     */
    getToolList: () => Array<{
        name: string;
        description: string;
        parameters: any;
    }>;
    /**
     * 등록된 도구 수 가져오기
     * @returns 도구 수
     */
    getToolCount: () => number;
    /**
     * 도구 이름으로 도구 찾기
     * @param name 도구 이름
     * @returns 도구 정의 또는 undefined
     */
    getToolByName: (name: string) => ToolDefinition | undefined;
>>>>>>> Stashed changes
};
export {};
