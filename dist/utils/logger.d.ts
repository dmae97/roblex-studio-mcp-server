/**
 * Simple logging utility for Roblex Studio MCP Server
 */
import { Logger } from '../sdk';
export interface ExtendedLogger extends Logger {
    logRequest(endpoint: string, request: any): void;
    logResponse(endpoint: string, response: any): void;
    logMcpEvent(eventType: string, details: any): void;
}
export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}
<<<<<<< Updated upstream
/**
 * 로그 레벨 변경
 * @param level 새 로그 레벨
 */
export declare function setLogLevel(level: LogLevel): void;
/**
 * 기본 로거
 */
export declare const logger: {
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
};
/**
 * Roblox Studio 전용 로거
 */
export declare const studioLogger: {
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
};
/**
 * 모델 전용 로거 생성
 */
export declare function createModelLogger(modelType: string, modelId: string): {
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
};
/**
 * 세션 전용 로거 생성
 */
export declare function createSessionLogger(sessionId: string, studioId?: string): {
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
};
/**
 * 서버 시작 로깅
 */
export declare function logServerStart(): void;
/**
 * 서버 종료 로깅
 */
export declare function logServerShutdown(): void;
/**
 * API 요청 로깅을 위한 Express 미들웨어
 */
export declare function requestLogger(req: any, res: any, next: Function): void;
=======
export declare const logger: ExtendedLogger;
>>>>>>> Stashed changes
