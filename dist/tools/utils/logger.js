"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;

// 실제 logger 모듈에서 로거 가져오기
const logger_original = require("../../utils/logger.js");
exports.logger = logger_original.logger; 