"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roblexPrompts = void 0;
const scriptGenerator_js_1 = require("./scriptGenerator.js");
const bugFinder_js_1 = require("./bugFinder.js");
const logger_js_1 = require("../utils/logger.js");
/**
 * Registry for all Roblex Studio prompts
 */
exports.roblexPrompts = {
    register: (server) => {
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
    }
};
//# sourceMappingURL=index.js.map