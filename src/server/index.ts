// 외부 모듈 및 내부 유틸리티 가져오기
import express from 'express';
import { 
    Schema,
    McpMessageHandler,
    McpRequestType,
    McpResponse,
    McpTransport,
    ToolCallHandler
} from '../sdk';
import { logger } from '../utils/logger';

// 구현 클래스 가져오기
import { McpServer, McpServerOptions } from './McpServer';
import { SSEServerTransport } from './SSEServerTransport';

// 재내보내기 - 다른 파일에서 이 모듈을 통해 접근할 수 있도록
export { McpServer, McpServerOptions } from './McpServer';
export { SSEServerTransport } from './SSEServerTransport';

// MCP 서버 팩토리 - 서버 인스턴스를 생성하는 편리한 방법 제공
export const McpServerFactory = {
    /**
     * 기본 MCP 서버 생성
     */
    create: (options: McpServerOptions): McpServer => {
        return new McpServer(options);
    }
};

/**
 * Roblex Studio 서비스 구현
 */
export class RoblexStudioService {
    public router: express.Router;
    
    constructor(options: { apiPrefix: string }) {
        this.router = express.Router();
        logger.info(`RoblexStudioService initialized with API prefix: ${options.apiPrefix}`);
        
        // 라우트 설정
        this.setupRoutes();
    }
    
    /**
     * 서비스 라우트 설정
     */
    private setupRoutes(): void {
        // 상태 확인 엔드포인트
        this.router.get('/status', (req, res) => {
            res.json({ status: 'ok' });
        });
        
        // 도구 목록 엔드포인트
        this.router.get('/tools', (req, res) => {
            res.json({ 
                tools: [],
                message: '사용 가능한 도구 목록' 
            });
        });
    }
}