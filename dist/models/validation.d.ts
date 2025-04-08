import { z } from 'zod';
/**
 * 모델 유효성 검사 유틸리티
 *
 * Roblox Studio 모델의 데이터 무결성을 보장하기 위한 스키마 검증 기능을 제공합니다.
 */
export declare const scriptModelSchema: z.ZodObject<{
    name: z.ZodString;
    id: z.ZodOptional<z.ZodString>;
    content: z.ZodString;
    type: z.ZodEnum<["ServerScript", "LocalScript", "ModuleScript"]>;
    parent: z.ZodOptional<z.ZodString>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    enabled: boolean;
    content: string;
    type: "ServerScript" | "LocalScript" | "ModuleScript";
    parent?: string | undefined;
    id?: string | undefined;
    properties?: Record<string, any> | undefined;
}, {
    name: string;
    content: string;
    type: "ServerScript" | "LocalScript" | "ModuleScript";
    enabled?: boolean | undefined;
    parent?: string | undefined;
    id?: string | undefined;
    properties?: Record<string, any> | undefined;
}>;
export declare const uiModelSchema: z.ZodObject<{
    name: z.ZodString;
    id: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["Frame", "Button", "TextLabel", "TextBox", "ImageLabel", "ScrollingFrame", "Other"]>;
    parent: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }>>;
    size: z.ZodOptional<z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        width: number;
        height: number;
    }, {
        width: number;
        height: number;
    }>>;
    visible: z.ZodDefault<z.ZodBoolean>;
    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    visible: boolean;
    type: "Frame" | "Button" | "TextLabel" | "TextBox" | "ImageLabel" | "ScrollingFrame" | "Other";
    position?: {
        x: number;
        y: number;
    } | undefined;
    parent?: string | undefined;
    id?: string | undefined;
    properties?: Record<string, any> | undefined;
    size?: {
        width: number;
        height: number;
    } | undefined;
}, {
    name: string;
    type: "Frame" | "Button" | "TextLabel" | "TextBox" | "ImageLabel" | "ScrollingFrame" | "Other";
    visible?: boolean | undefined;
    position?: {
        x: number;
        y: number;
    } | undefined;
    parent?: string | undefined;
    id?: string | undefined;
    properties?: Record<string, any> | undefined;
    size?: {
        width: number;
        height: number;
    } | undefined;
}>;
export declare const serviceModelSchema: z.ZodObject<{
    name: z.ZodString;
    id: z.ZodOptional<z.ZodString>;
    serviceType: z.ZodString;
    enabled: z.ZodDefault<z.ZodBoolean>;
    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    enabled: boolean;
    serviceType: string;
    id?: string | undefined;
    properties?: Record<string, any> | undefined;
}, {
    name: string;
    serviceType: string;
    enabled?: boolean | undefined;
    id?: string | undefined;
    properties?: Record<string, any> | undefined;
}>;
/**
 * 모델 데이터 유효성 검사
 * @param data 검증할 데이터
 * @param modelType 모델 타입
 * @returns 검증 결과 (성공, 오류)
 */
export declare function validateModelData(data: any, modelType: 'script' | 'ui' | 'service'): {
    success: boolean;
    data?: any;
    errors?: any;
};
/**
 * 모델 업데이트 시 필드 유효성 검사
 * @param updates 업데이트할 필드
 * @param modelType 모델 타입
 * @returns 검증 결과 (성공, 오류, 정제된 데이터)
 */
export declare function validateModelUpdates(updates: Record<string, any>, modelType: 'script' | 'ui' | 'service'): {
    success: boolean;
    data?: Record<string, any>;
    errors?: any;
};
