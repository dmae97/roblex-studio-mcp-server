"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roblexResources = void 0;
const documentation_js_1 = require("./documentation.js");
const templates_js_1 = require("./templates.js");
const logger_js_1 = require("../utils/logger.js");
/**
 * Registry for all Roblex Studio resources
 */
exports.roblexResources = {
    register: (server) => {
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
    }
};
//# sourceMappingURL=index.js.map