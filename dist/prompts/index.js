"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roblexPrompts = void 0;
<<<<<<< Updated upstream
const scriptGenerator_js_1 = require("./scriptGenerator.js");
const bugFinder_js_1 = require("./bugFinder.js");
const logger_js_1 = require("../utils/logger.js");
/**
 * Registry for all Roblex Studio prompts
 */
=======
const logger_1 = require("../utils/logger");
// 예시 프롬프트: 도구 사용 방법
const toolUsagePrompt = {
    name: 'tool-usage',
    description: '도구 사용 방법에 대한 프롬프트 제공',
    handler: async (params, _context) => {
        logger_1.logger.debug('도구 사용 방법 프롬프트 요청됨');
        const toolName = params.toolName || 'unknown';
        return `이 도구(${toolName})를 사용하려면 다음 단계를 따르세요:
1. 도구의 목적과 기능을 이해합니다.
2. 필요한 매개변수를 준비합니다.
3. 도구를 호출하고 결과를 확인합니다.
4. 필요한 경우 매개변수를 조정하여 다시 시도합니다.`;
    }
};
// 모든 프롬프트 목록
const allPrompts = [
    toolUsagePrompt,
    // 더 많은 프롬프트 추가 가능
];
// 프롬프트 등록 및 관리를 위한 객체
>>>>>>> Stashed changes
exports.roblexPrompts = {
    /**
     * 서버에 프롬프트 등록
     * @param server MCP 서버 인스턴스
     */
    register: (server) => {
<<<<<<< Updated upstream
        logger_js_1.logger.info('Registering Roblex Studio prompts...');
        try {
            // 스크립트 생성기 프롬프트 등록
            if (scriptGenerator_js_1.scriptGenerator && typeof scriptGenerator_js_1.scriptGenerator.register === 'function') {
                scriptGenerator_js_1.scriptGenerator.register(server);
            }
            // 버그 파인더 프롬프트 등록
            if (bugFinder_js_1.bugFinder && typeof bugFinder_js_1.bugFinder.register === 'function') {
                bugFinder_js_1.bugFinder.register(server);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger_js_1.logger.error(`Error registering prompts: ${errorMessage}`);
        }
        logger_js_1.logger.info('Roblex Studio prompts registered successfully');
=======
        logger_1.logger.info(`${allPrompts.length}개의 프롬프트 등록 중...`);
        allPrompts.forEach(prompt => {
            logger_1.logger.debug(`프롬프트 등록: ${prompt.name}`);
            server.prompt(prompt.name, prompt.description, prompt.handler);
        });
        logger_1.logger.info('모든 프롬프트 등록 완료');
    },
    /**
     * 등록된 프롬프트 목록 가져오기
     * @returns 프롬프트 정의 목록
     */
    getPromptList: () => {
        return allPrompts.map(prompt => ({
            name: prompt.name,
            description: prompt.description
        }));
    },
    /**
     * 등록된 프롬프트 수 가져오기
     * @returns 프롬프트 수
     */
    getPromptCount: () => {
        return allPrompts.length;
    },
    /**
     * 프롬프트 이름으로 프롬프트 찾기
     * @param name 프롬프트 이름
     * @returns 프롬프트 정의 또는 undefined
     */
    getPromptByName: (name) => {
        return allPrompts.find(prompt => prompt.name === name);
>>>>>>> Stashed changes
    }
};
//# sourceMappingURL=index.js.map