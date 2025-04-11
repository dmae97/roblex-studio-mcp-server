"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roblexResources = void 0;
<<<<<<< Updated upstream
const documentation_js_1 = require("./documentation.js");
const templates_js_1 = require("./templates.js");
const logger_js_1 = require("../utils/logger.js");
/**
 * Registry for all Roblex Studio resources
 */
=======
const logger_1 = require("../utils/logger");
// 예시 리소스: 도움말
const helpResource = {
    name: 'help',
    description: '서버 및 도구 사용 방법에 대한 정보 제공',
    handler: async (_params, _context) => {
        logger_1.logger.debug('도움말 리소스 요청됨');
        return {
            server: {
                name: 'Roblex Studio MCP Server',
                description: 'Roblex Studio 환경을 위한 AI 도우미 서버'
            },
            tools: {
                'get-current-time': '현재 시간 조회',
                // 다른 도구들의 설명 추가 가능
            },
            resources: {
                'help': '서버 및 도구 사용 방법에 대한 정보'
            }
        };
    }
};
// 모든 리소스 목록
const allResources = [
    helpResource,
    // 더 많은 리소스 추가 가능
];
// 리소스 등록 및 관리를 위한 객체
>>>>>>> Stashed changes
exports.roblexResources = {
    /**
     * 서버에 리소스 등록
     * @param server MCP 서버 인스턴스
     */
    register: (server) => {
<<<<<<< Updated upstream
        logger_js_1.logger.info('Registering Roblex Studio resources...');
        try {
            // 문서 리소스 등록
            if (documentation_js_1.documentation && typeof documentation_js_1.documentation.register === 'function') {
                documentation_js_1.documentation.register(server);
            }
            // 템플릿 리소스 등록
            if (templates_js_1.templates && typeof templates_js_1.templates.register === 'function') {
                templates_js_1.templates.register(server);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger_js_1.logger.error(`Error registering resources: ${errorMessage}`);
        }
        logger_js_1.logger.info('Roblex Studio resources registered successfully');
=======
        logger_1.logger.info(`${allResources.length}개의 리소스 등록 중...`);
        allResources.forEach(resource => {
            logger_1.logger.debug(`리소스 등록: ${resource.name}`);
            server.resource(resource.name, resource.description, resource.handler);
        });
        logger_1.logger.info('모든 리소스 등록 완료');
    },
    /**
     * 등록된 리소스 목록 가져오기
     * @returns 리소스 정의 목록
     */
    getResourceList: () => {
        return allResources.map(resource => ({
            name: resource.name,
            description: resource.description
        }));
    },
    /**
     * 등록된 리소스 수 가져오기
     * @returns 리소스 수
     */
    getResourceCount: () => {
        return allResources.length;
    },
    /**
     * 리소스 이름으로 리소스 찾기
     * @param name 리소스 이름
     * @returns 리소스 정의 또는 undefined
     */
    getResourceByName: (name) => {
        return allResources.find(resource => resource.name === name);
>>>>>>> Stashed changes
    }
};
//# sourceMappingURL=index.js.map