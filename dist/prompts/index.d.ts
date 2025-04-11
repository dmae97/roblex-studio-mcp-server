import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Registry for all Roblex Studio prompts
 */
import { McpServer } from '../server/McpServer';
interface PromptDefinition {
    name: string;
    description: string;
    handler: (params: any, context?: any) => Promise<string>;
}
export declare const roblexPrompts: {
<<<<<<< Updated upstream
    register: (server: McpServer) => void;
=======
    /**
     * 서버에 프롬프트 등록
     * @param server MCP 서버 인스턴스
     */
    register: (server: McpServer) => void;
    /**
     * 등록된 프롬프트 목록 가져오기
     * @returns 프롬프트 정의 목록
     */
    getPromptList: () => Array<{
        name: string;
        description: string;
    }>;
    /**
     * 등록된 프롬프트 수 가져오기
     * @returns 프롬프트 수
     */
    getPromptCount: () => number;
    /**
     * 프롬프트 이름으로 프롬프트 찾기
     * @param name 프롬프트 이름
     * @returns 프롬프트 정의 또는 undefined
     */
    getPromptByName: (name: string) => PromptDefinition | undefined;
>>>>>>> Stashed changes
};
export {};
