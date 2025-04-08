"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateModelUpdates = exports.validateModelData = exports.serviceModelSchema = exports.uiModelSchema = exports.scriptModelSchema = void 0;
const logger_js_1 = require("../utils/logger.js");
const zod_1 = require("zod");
/**
 * 모델 유효성 검사 유틸리티
 *
 * Roblox Studio 모델의 데이터 무결성을 보장하기 위한 스키마 검증 기능을 제공합니다.
 */
// 기본 스크립트 모델 스키마
exports.scriptModelSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    id: zod_1.z.string().optional(),
    content: zod_1.z.string(),
    type: zod_1.z.enum(['ServerScript', 'LocalScript', 'ModuleScript']),
    parent: zod_1.z.string().optional(),
    enabled: zod_1.z.boolean().default(true),
    properties: zod_1.z.record(zod_1.z.any()).optional()
});
// UI 모델 스키마
exports.uiModelSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    id: zod_1.z.string().optional(),
    type: zod_1.z.enum(['Frame', 'Button', 'TextLabel', 'TextBox', 'ImageLabel', 'ScrollingFrame', 'Other']),
    parent: zod_1.z.string().optional(),
    position: zod_1.z.object({
        x: zod_1.z.number(),
        y: zod_1.z.number()
    }).optional(),
    size: zod_1.z.object({
        width: zod_1.z.number(),
        height: zod_1.z.number()
    }).optional(),
    visible: zod_1.z.boolean().default(true),
    properties: zod_1.z.record(zod_1.z.any()).optional()
});
// 서비스 모델 스키마
exports.serviceModelSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    id: zod_1.z.string().optional(),
    serviceType: zod_1.z.string(),
    enabled: zod_1.z.boolean().default(true),
    properties: zod_1.z.record(zod_1.z.any()).optional()
});
/**
 * 모델 데이터 유효성 검사
 * @param data 검증할 데이터
 * @param modelType 모델 타입
 * @returns 검증 결과 (성공, 오류)
 */
function validateModelData(data, modelType) {
    try {
        switch (modelType) {
            case 'script':
                return { success: true, data: exports.scriptModelSchema.parse(data) };
            case 'ui':
                return { success: true, data: exports.uiModelSchema.parse(data) };
            case 'service':
                return { success: true, data: exports.serviceModelSchema.parse(data) };
            default:
                return { success: false, errors: 'Unknown model type' };
        }
    }
    catch (error) {
        logger_js_1.logger.warn(`Model validation failed: ${error instanceof Error ? error.message : String(error)}`);
        if (error instanceof zod_1.z.ZodError) {
            return { success: false, errors: error.format() };
        }
        return { success: false, errors: 'Validation error' };
    }
}
exports.validateModelData = validateModelData;
/**
 * 모델 업데이트 시 필드 유효성 검사
 * @param updates 업데이트할 필드
 * @param modelType 모델 타입
 * @returns 검증 결과 (성공, 오류, 정제된 데이터)
 */
function validateModelUpdates(updates, modelType) {
    try {
        // 필드별로 부분 검증
        const schema = getSchemaForModelType(modelType);
        const validatedUpdates = {};
        const errors = {};
        // 각 필드별로 검증 시도
        Object.entries(updates).forEach(([key, value]) => {
            const fieldSchema = getFieldSchema(schema, key);
            if (fieldSchema) {
                try {
                    validatedUpdates[key] = fieldSchema.parse(value);
                }
                catch (fieldError) {
                    if (fieldError instanceof zod_1.z.ZodError) {
                        errors[key] = fieldError.format();
                    }
                    else {
                        errors[key] = `Invalid value for field: ${key}`;
                    }
                }
            }
            else {
                // 스키마에 없는 필드는 properties로 간주
                if (!validatedUpdates.properties) {
                    validatedUpdates.properties = {};
                }
                validatedUpdates.properties[key] = value;
            }
        });
        if (Object.keys(errors).length > 0) {
            return { success: false, errors };
        }
        return { success: true, data: validatedUpdates };
    }
    catch (error) {
        logger_js_1.logger.warn(`Model update validation failed: ${error instanceof Error ? error.message : String(error)}`);
        return { success: false, errors: 'Validation error' };
    }
}
exports.validateModelUpdates = validateModelUpdates;
// 모델 타입에 맞는 스키마 가져오기
function getSchemaForModelType(modelType) {
    switch (modelType) {
        case 'script':
            return exports.scriptModelSchema;
        case 'ui':
            return exports.uiModelSchema;
        case 'service':
            return exports.serviceModelSchema;
        default:
            throw new Error('Unknown model type');
    }
}
// 특정 필드의 스키마 가져오기
function getFieldSchema(schema, field) {
    if (schema.shape[field]) {
        return schema.shape[field];
    }
    return null;
}
//# sourceMappingURL=validation.js.map