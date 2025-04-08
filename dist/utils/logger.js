/**
 * Simple logging utility for Roblex Studio MCP Server
 */
// 로그 레벨 enum
export var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
})(LogLevel || (LogLevel = {}));
// 로그 레벨에 따른 우선순위 (낮을수록 더 많은 로그)
const LOG_PRIORITIES = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3
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
    const timestamp = getTimestamp();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    // 콘솔에 로그 출력 (색상 적용)
    console.log(`${COLORS.timestamp}[${timestamp}]${COLORS.reset} ${COLORS[level]}[${level.toUpperCase()}]${COLORS.reset} ${message}${metaStr}`);
}
/**
 * 로그 레벨 변경
 * @param level 새 로그 레벨
 */
export function setLogLevel(level) {
    if (LOG_PRIORITIES[level] !== undefined) {
        currentLogPriority = LOG_PRIORITIES[level];
        log(LogLevel.INFO, `Log level changed to: ${level}`);
    }
    else {
        log(LogLevel.ERROR, `Invalid log level: ${level}`);
    }
}
/**
 * 기본 로거
 */
export const logger = {
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
    }
};
/**
 * Roblox Studio 전용 로거
 */
export const studioLogger = {
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
export function createModelLogger(modelType, modelId) {
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
/**
 * 세션 전용 로거 생성
 */
export function createSessionLogger(sessionId, studioId) {
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
/**
 * 서버 시작 로깅
 */
export function logServerStart() {
    logger.info('Server starting up');
}
/**
 * 서버 종료 로깅
 */
export function logServerShutdown() {
    logger.info('Server shutting down');
}
/**
 * API 요청 로깅을 위한 Express 미들웨어
 */
export function requestLogger(req, res, next) {
    const start = Date.now();
    // 응답 완료 후 로깅
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
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
//# sourceMappingURL=logger.js.map