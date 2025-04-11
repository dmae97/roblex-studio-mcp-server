"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.logServerShutdown = exports.logServerStart = exports.createSessionLogger = exports.createModelLogger = exports.studioLogger = exports.logger = exports.setLogLevel = exports.LogLevel = void 0;
// 로그 레벨 enum
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
<<<<<<< Updated upstream
// 로그 레벨에 따른 우선순위 (낮을수록 더 많은 로그)
const LOG_PRIORITIES = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3
=======
// 로깅 유틸리티
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
// Helper function to get timestamp
const getTimestamp = () => {
    return new Date().toISOString();
>>>>>>> Stashed changes
};
// 환경 변수에서 로그 레벨 가져오기 (기본: INFO)
const LOG_LEVEL = process.env.LOG_LEVEL || LogLevel.INFO;
// 현재 로그 레벨의 우선순위
let currentLogPriority = LOG_PRIORITIES[LOG_LEVEL] || LOG_PRIORITIES[LogLevel.INFO];
// ANSI 색상 코드
const COLORS = {
    reset: '\x1b[0m',
    debug: '\x1b[36m', // 청록색
    info: '\x1b[32m', // 녹색
    warn: '\x1b[33m', // 노란색
    error: '\x1b[31m', // 빨간색
    timestamp: '\x1b[90m' // 회색
};
/**
 * 현재 시간을 ISO 형식 문자열로 반환
 */
function getTimestamp() {
    return new Date().toISOString();
}
/**
 * 특정 레벨의 메시지를 로깅
 * @param level 로그 레벨
 * @param message 메시지
 * @param meta 추가 데이터
 */
function log(level, message, meta) {
    // 현재 로그 레벨보다 우선순위가 낮은 로그는 무시
    if (LOG_PRIORITIES[level] < currentLogPriority) {
        return;
    }
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    // 표준 에러(stderr)로 로그 출력 (타임스탬프, 레벨, 색상 제거)
    console.error(`${message}${metaStr}`);
}
/**
 * 로그 레벨 변경
 * @param level 새 로그 레벨
 */
function setLogLevel(level) {
    if (LOG_PRIORITIES[level] !== undefined) {
        currentLogPriority = LOG_PRIORITIES[level];
        log(LogLevel.INFO, `Log level changed to: ${level}`);
    }
    else {
        log(LogLevel.ERROR, `Invalid log level: ${level}`);
    }
}
exports.setLogLevel = setLogLevel;
/**
 * 기본 로거
 */
exports.logger = {
<<<<<<< Updated upstream
    debug(message, meta) {
        log(LogLevel.DEBUG, message, meta);
    },
    info(message, meta) {
        log(LogLevel.INFO, message, meta);
    },
    warn(message, meta) {
        log(LogLevel.WARN, message, meta);
    },
    error(message, meta) {
        log(LogLevel.ERROR, message, meta);
=======
    debug: (message) => {
        if (LOG_LEVEL === 'debug') {
            console.log(`[${getTimestamp()}] [DEBUG] ${message}`);
        }
    },
    info: (message) => {
        if (LOG_LEVEL === 'debug' || LOG_LEVEL === 'info') {
            console.log(`[${getTimestamp()}] [INFO] ${message}`);
        }
    },
    warn: (message) => {
        if (LOG_LEVEL === 'debug' || LOG_LEVEL === 'info' || LOG_LEVEL === 'warn') {
            console.warn(`[${getTimestamp()}] [WARN] ${message}`);
        }
    },
    error: (message) => {
        console.error(`[${getTimestamp()}] [ERROR] ${message}`);
    },
    // 요청과 응답을 자세히 로깅하는 함수 추가
    logRequest: (endpoint, request) => {
        if (LOG_LEVEL === 'debug') {
            console.log(`[${getTimestamp()}] [DEBUG] 수신된 요청 - ${endpoint}: ${JSON.stringify(request, null, 2)}`);
        }
    },
    logResponse: (endpoint, response) => {
        if (LOG_LEVEL === 'debug') {
            console.log(`[${getTimestamp()}] [DEBUG] 전송된 응답 - ${endpoint}: ${JSON.stringify(response, null, 2)}`);
        }
    },
    // MCP 프로토콜 관련 이벤트 로깅
    logMcpEvent: (eventType, details) => {
        if (LOG_LEVEL === 'debug' || LOG_LEVEL === 'info') {
            console.log(`[${getTimestamp()}] [MCP] ${eventType}: ${JSON.stringify(details, null, 2)}`);
        }
>>>>>>> Stashed changes
    }
};
/**
 * Roblox Studio 전용 로거
 */
exports.studioLogger = {
    debug(message, meta) {
        log(LogLevel.DEBUG, message, { ...meta, context: 'studio' });
    },
    info(message, meta) {
        log(LogLevel.INFO, message, { ...meta, context: 'studio' });
    },
    warn(message, meta) {
        log(LogLevel.WARN, message, { ...meta, context: 'studio' });
    },
    error(message, meta) {
        log(LogLevel.ERROR, message, { ...meta, context: 'studio' });
    }
};
/**
 * 모델 전용 로거 생성
 */
function createModelLogger(modelType, modelId) {
    return {
        debug(message, meta) {
            log(LogLevel.DEBUG, message, { ...meta, modelType, modelId, context: 'model' });
        },
        info(message, meta) {
            log(LogLevel.INFO, message, { ...meta, modelType, modelId, context: 'model' });
        },
        warn(message, meta) {
            log(LogLevel.WARN, message, { ...meta, modelType, modelId, context: 'model' });
        },
        error(message, meta) {
            log(LogLevel.ERROR, message, { ...meta, modelType, modelId, context: 'model' });
        }
    };
}
exports.createModelLogger = createModelLogger;
/**
 * 세션 전용 로거 생성
 */
function createSessionLogger(sessionId, studioId) {
    return {
        debug(message, meta) {
            log(LogLevel.DEBUG, message, { ...meta, sessionId, studioId, context: 'session' });
        },
        info(message, meta) {
            log(LogLevel.INFO, message, { ...meta, sessionId, studioId, context: 'session' });
        },
        warn(message, meta) {
            log(LogLevel.WARN, message, { ...meta, sessionId, studioId, context: 'session' });
        },
        error(message, meta) {
            log(LogLevel.ERROR, message, { ...meta, sessionId, studioId, context: 'session' });
        }
    };
}
exports.createSessionLogger = createSessionLogger;
/**
 * 서버 시작 로깅
 */
function logServerStart() {
    exports.logger.info('Server starting up');
}
exports.logServerStart = logServerStart;
/**
 * 서버 종료 로깅
 */
function logServerShutdown() {
    exports.logger.info('Server shutting down');
}
exports.logServerShutdown = logServerShutdown;
/**
 * API 요청 로깅을 위한 Express 미들웨어
 */
function requestLogger(req, res, next) {
    const start = Date.now();
    // 응답 완료 후 로깅
    res.on('finish', () => {
        const duration = Date.now() - start;
        exports.logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration,
            ip: req.ip || 'unknown',
            userAgent: req.get('user-agent') || 'unknown'
        });
    });
    next();
}
exports.requestLogger = requestLogger;
//# sourceMappingURL=logger.js.map