import { logger } from '../utils/logger.js';
import { z } from 'zod';

/**
 * 모델 유효성 검사 유틸리티
 * 
 * Roblox Studio 모델의 데이터 무결성을 보장하기 위한 스키마 검증 기능을 제공합니다.
 */

// 기본 스크립트 모델 스키마
export const scriptModelSchema = z.object({
  name: z.string().min(1),
  id: z.string().optional(),
  content: z.string(),
  type: z.enum(['ServerScript', 'LocalScript', 'ModuleScript']),
  parent: z.string().optional(),
  enabled: z.boolean().default(true),
  properties: z.record(z.any()).optional()
});

// UI 모델 스키마
export const uiModelSchema = z.object({
  name: z.string().min(1),
  id: z.string().optional(),
  type: z.enum(['Frame', 'Button', 'TextLabel', 'TextBox', 'ImageLabel', 'ScrollingFrame', 'Other']),
  parent: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }).optional(),
  size: z.object({
    width: z.number(),
    height: z.number()
  }).optional(),
  visible: z.boolean().default(true),
  properties: z.record(z.any()).optional()
});

// 서비스 모델 스키마
export const serviceModelSchema = z.object({
  name: z.string().min(1),
  id: z.string().optional(),
  serviceType: z.string(),
  enabled: z.boolean().default(true),
  properties: z.record(z.any()).optional()
});

/**
 * 모델 데이터 유효성 검사
 * @param data 검증할 데이터
 * @param modelType 모델 타입
 * @returns 검증 결과 (성공, 오류)
 */
export function validateModelData(data: any, modelType: 'script' | 'ui' | 'service'): { 
  success: boolean; 
  data?: any; 
  errors?: any 
} {
  try {
    switch (modelType) {
      case 'script':
        return { success: true, data: scriptModelSchema.parse(data) };
      case 'ui':
        return { success: true, data: uiModelSchema.parse(data) };
      case 'service':
        return { success: true, data: serviceModelSchema.parse(data) };
      default:
        return { success: false, errors: 'Unknown model type' };
    }
  } catch (error) {
    logger.warn(`Model validation failed: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.format() };
    }
    return { success: false, errors: 'Validation error' };
  }
}

/**
 * 모델 업데이트 시 필드 유효성 검사
 * @param updates 업데이트할 필드
 * @param modelType 모델 타입
 * @returns 검증 결과 (성공, 오류, 정제된 데이터)
 */
export function validateModelUpdates(updates: Record<string, any>, modelType: 'script' | 'ui' | 'service'): {
  success: boolean;
  data?: Record<string, any>;
  errors?: any;
} {
  try {
    // 필드별로 부분 검증
    const schema = getSchemaForModelType(modelType);
    const validatedUpdates: Record<string, any> = {};
    const errors: Record<string, any> = {};

    // 각 필드별로 검증 시도
    Object.entries(updates).forEach(([key, value]) => {
      const fieldSchema = getFieldSchema(schema, key);
      if (fieldSchema) {
        try {
          validatedUpdates[key] = fieldSchema.parse(value);
        } catch (fieldError) {
          if (fieldError instanceof z.ZodError) {
            errors[key] = fieldError.format();
          } else {
            errors[key] = `Invalid value for field: ${key}`;
          }
        }
      } else {
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
  } catch (error) {
    logger.warn(`Model update validation failed: ${error instanceof Error ? error.message : String(error)}`);
    return { success: false, errors: 'Validation error' };
  }
}

// 모델 타입에 맞는 스키마 가져오기
function getSchemaForModelType(modelType: 'script' | 'ui' | 'service'): z.ZodObject<any> {
  switch (modelType) {
    case 'script':
      return scriptModelSchema;
    case 'ui':
      return uiModelSchema;
    case 'service':
      return serviceModelSchema;
    default:
      throw new Error('Unknown model type');
  }
}

// 특정 필드의 스키마 가져오기
function getFieldSchema(schema: z.ZodObject<any>, field: string): z.ZodTypeAny | null {
  if (schema.shape[field]) {
    return schema.shape[field];
  }
  return null;
} 