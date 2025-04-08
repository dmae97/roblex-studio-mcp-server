"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environmentSchema = exports.terrainSchema = exports.levelDesignSchema = void 0;
const zod_1 = require("zod");
/**
 * Validation schema for level design parameters
 */
exports.levelDesignSchema = zod_1.z.object({
    levelType: zod_1.z.enum(['platformer', 'maze', 'open-world', 'tower-defense', 'obstacle-course', 'racing', 'custom']),
    size: zod_1.z.enum(['small', 'medium', 'large', 'custom']),
    theme: zod_1.z.string().optional(),
    difficulty: zod_1.z.enum(['easy', 'medium', 'hard', 'expert']).optional(),
    features: zod_1.z.array(zod_1.z.string()).optional(),
    customParameters: zod_1.z.record(zod_1.z.string()).optional(),
    includePlayerSpawns: zod_1.z.boolean().optional().default(true),
    includeCheckpoints: zod_1.z.boolean().optional().default(true),
    environmentSettings: zod_1.z.object({
        lighting: zod_1.z.enum(['day', 'night', 'dawn', 'dusk', 'custom']).optional(),
        weather: zod_1.z.enum(['clear', 'rain', 'snow', 'fog', 'custom']).optional(),
        gravity: zod_1.z.number().optional(),
        ambientSounds: zod_1.z.array(zod_1.z.string()).optional()
    }).optional()
});
/**
 * Validation schema for terrain generation parameters
 */
exports.terrainSchema = zod_1.z.object({
    terrainType: zod_1.z.enum(['flat', 'hills', 'mountains', 'islands', 'caves', 'custom']),
    materialSettings: zod_1.z.record(zod_1.z.string()).optional(),
    waterEnabled: zod_1.z.boolean().optional().default(false),
    size: zod_1.z.object({
        x: zod_1.z.number(),
        y: zod_1.z.number(),
        z: zod_1.z.number()
    }),
    detailLevel: zod_1.z.enum(['low', 'medium', 'high']).optional(),
    seed: zod_1.z.number().optional(),
});
/**
 * Validation schema for environment settings parameters
 */
exports.environmentSchema = zod_1.z.object({
    lighting: zod_1.z.object({
        ambient: zod_1.z.string().optional(),
        brightness: zod_1.z.number().optional(),
        time: zod_1.z.number().optional(),
        shadows: zod_1.z.boolean().optional(),
        colorShift: zod_1.z.object({
            top: zod_1.z.string().optional(),
            bottom: zod_1.z.string().optional()
        }).optional()
    }).optional(),
    fog: zod_1.z.object({
        enabled: zod_1.z.boolean().optional(),
        start: zod_1.z.number().optional(),
        end: zod_1.z.number().optional(),
        color: zod_1.z.string().optional()
    }).optional(),
    atmosphere: zod_1.z.object({
        density: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        color: zod_1.z.string().optional(),
        glare: zod_1.z.number().optional()
    }).optional(),
    soundscape: zod_1.z.array(zod_1.z.object({
        soundId: zod_1.z.string(),
        looped: zod_1.z.boolean().optional(),
        volume: zod_1.z.number().optional()
    })).optional()
});
//# sourceMappingURL=schemas.js.map