"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roblexTools = void 0;
const codeGenerator_1 = require("./codeGenerator");
/**
 * Collection of Roblex Studio tools for MCP Server
 */
exports.roblexTools = {
    register: (server) => {
        // Register all tools
        codeGenerator_1.codeGenerator.register(server);
    }
};
//# sourceMappingURL=index.js.map