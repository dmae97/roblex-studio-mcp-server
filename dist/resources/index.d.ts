import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Registry for all Roblex Studio resources
 */
import { McpServer } from '../server/McpServer';
interface ResourceDefinition {
    name: string;
    description: string;
    handler: (params: any, context?: any) => Promise<any>;
}
export declare const roblexResources: {
<<<<<<< Updated upstream
    register: (server: McpServer) => void;
=======
    /**
     * 서버에 리소스 등록
     * @param server MCP 서버 인스턴스
     */
    register: (server: McpServer) => void;
    /**
     * 등록된 리소스 목록 가져오기
     * @returns 리소스 정의 목록
     */
    getResourceList: () => Array<{
        name: string;
        description: string;
    }>;
    /**
     * 등록된 리소스 수 가져오기
     * @returns 리소스 수
     */
    getResourceCount: () => number;
    /**
     * 리소스 이름으로 리소스 찾기
     * @param name 리소스 이름
     * @returns 리소스 정의 또는 undefined
     */
    getResourceByName: (name: string) => ResourceDefinition | undefined;
>>>>>>> Stashed changes
};
export {};
