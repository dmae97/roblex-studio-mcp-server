import { z } from 'zod';
/**
 * Validation schema for level design parameters
 */
export const levelDesignSchema = z.object({
    levelType: z.enum(['platformer', 'maze', 'open-world', 'tower-defense', 'obstacle-course', 'racing', 'custom']),
    size: z.enum(['small', 'medium', 'large', 'custom']),
    theme: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).optional(),
    features: z.array(z.string()).optional(),
    customParameters: z.record(z.string()).optional(),
    includePlayerSpawns: z.boolean().optional().default(true),
    includeCheckpoints: z.boolean().optional().default(true),
    environmentSettings: z.object({
        lighting: z.enum(['day', 'night', 'dawn', 'dusk', 'custom']).optional(),
        weather: z.enum(['clear', 'rain', 'snow', 'fog', 'custom']).optional(),
        gravity: z.number().optional(),
        ambientSounds: z.array(z.string()).optional()
    }).optional()
});
/**
 * Validation schema for terrain generation parameters
 */
export const terrainSchema = z.object({
    terrainType: z.enum(['flat', 'hills', 'mountains', 'islands', 'caves', 'custom']),
    materialSettings: z.record(z.string()).optional(),
    waterEnabled: z.boolean().optional().default(false),
    size: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number()
    }),
    detailLevel: z.enum(['low', 'medium', 'high']).optional(),
    seed: z.number().optional(),
});
/**
 * Validation schema for environment settings parameters
 */
export const environmentSchema = z.object({
    lighting: z.object({
        ambient: z.string().optional(),
        brightness: z.number().optional(),
        time: z.number().optional(),
        shadows: z.boolean().optional(),
        colorShift: z.object({
            top: z.string().optional(),
            bottom: z.string().optional()
        }).optional()
    }).optional(),
    fog: z.object({
        enabled: z.boolean().optional(),
        start: z.number().optional(),
        end: z.number().optional(),
        color: z.string().optional()
    }).optional(),
    atmosphere: z.object({
        density: z.number().optional(),
        offset: z.number().optional(),
        color: z.string().optional(),
        glare: z.number().optional()
    }).optional(),
    soundscape: z.array(z.object({
        soundId: z.string(),
        looped: z.boolean().optional(),
        volume: z.number().optional()
    })).optional()
});
//# sourceMappingURL=schemas.js.map