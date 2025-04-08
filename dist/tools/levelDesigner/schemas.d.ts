import { z } from 'zod';
/**
 * Validation schema for level design parameters
 */
export declare const levelDesignSchema: z.ZodObject<{
    levelType: z.ZodEnum<["platformer", "maze", "open-world", "tower-defense", "obstacle-course", "racing", "custom"]>;
    size: z.ZodEnum<["small", "medium", "large", "custom"]>;
    theme: z.ZodOptional<z.ZodString>;
    difficulty: z.ZodOptional<z.ZodEnum<["easy", "medium", "hard", "expert"]>>;
    features: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    customParameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    includePlayerSpawns: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeCheckpoints: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    environmentSettings: z.ZodOptional<z.ZodObject<{
        lighting: z.ZodOptional<z.ZodEnum<["day", "night", "dawn", "dusk", "custom"]>>;
        weather: z.ZodOptional<z.ZodEnum<["clear", "rain", "snow", "fog", "custom"]>>;
        gravity: z.ZodOptional<z.ZodNumber>;
        ambientSounds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        weather?: "custom" | "fog" | "clear" | "rain" | "snow" | undefined;
        gravity?: number | undefined;
        lighting?: "custom" | "day" | "night" | "dawn" | "dusk" | undefined;
        ambientSounds?: string[] | undefined;
    }, {
        weather?: "custom" | "fog" | "clear" | "rain" | "snow" | undefined;
        gravity?: number | undefined;
        lighting?: "custom" | "day" | "night" | "dawn" | "dusk" | undefined;
        ambientSounds?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    size: "custom" | "small" | "medium" | "large";
    levelType: "custom" | "platformer" | "maze" | "open-world" | "tower-defense" | "obstacle-course" | "racing";
    includePlayerSpawns: boolean;
    includeCheckpoints: boolean;
    theme?: string | undefined;
    difficulty?: "medium" | "easy" | "hard" | "expert" | undefined;
    features?: string[] | undefined;
    customParameters?: Record<string, string> | undefined;
    environmentSettings?: {
        weather?: "custom" | "fog" | "clear" | "rain" | "snow" | undefined;
        gravity?: number | undefined;
        lighting?: "custom" | "day" | "night" | "dawn" | "dusk" | undefined;
        ambientSounds?: string[] | undefined;
    } | undefined;
}, {
    size: "custom" | "small" | "medium" | "large";
    levelType: "custom" | "platformer" | "maze" | "open-world" | "tower-defense" | "obstacle-course" | "racing";
    includePlayerSpawns?: boolean | undefined;
    includeCheckpoints?: boolean | undefined;
    theme?: string | undefined;
    difficulty?: "medium" | "easy" | "hard" | "expert" | undefined;
    features?: string[] | undefined;
    customParameters?: Record<string, string> | undefined;
    environmentSettings?: {
        weather?: "custom" | "fog" | "clear" | "rain" | "snow" | undefined;
        gravity?: number | undefined;
        lighting?: "custom" | "day" | "night" | "dawn" | "dusk" | undefined;
        ambientSounds?: string[] | undefined;
    } | undefined;
}>;
/**
 * Validation schema for terrain generation parameters
 */
export declare const terrainSchema: z.ZodObject<{
    terrainType: z.ZodEnum<["flat", "hills", "mountains", "islands", "caves", "custom"]>;
    materialSettings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    waterEnabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    size: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        z: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        z: number;
    }, {
        x: number;
        y: number;
        z: number;
    }>;
    detailLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    seed: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    size: {
        x: number;
        y: number;
        z: number;
    };
    terrainType: "flat" | "custom" | "hills" | "mountains" | "islands" | "caves";
    waterEnabled: boolean;
    materialSettings?: Record<string, string> | undefined;
    detailLevel?: "high" | "medium" | "low" | undefined;
    seed?: number | undefined;
}, {
    size: {
        x: number;
        y: number;
        z: number;
    };
    terrainType: "flat" | "custom" | "hills" | "mountains" | "islands" | "caves";
    waterEnabled?: boolean | undefined;
    materialSettings?: Record<string, string> | undefined;
    detailLevel?: "high" | "medium" | "low" | undefined;
    seed?: number | undefined;
}>;
/**
 * Validation schema for environment settings parameters
 */
export declare const environmentSchema: z.ZodObject<{
    lighting: z.ZodOptional<z.ZodObject<{
        ambient: z.ZodOptional<z.ZodString>;
        brightness: z.ZodOptional<z.ZodNumber>;
        time: z.ZodOptional<z.ZodNumber>;
        shadows: z.ZodOptional<z.ZodBoolean>;
        colorShift: z.ZodOptional<z.ZodObject<{
            top: z.ZodOptional<z.ZodString>;
            bottom: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            top?: string | undefined;
            bottom?: string | undefined;
        }, {
            top?: string | undefined;
            bottom?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        time?: number | undefined;
        ambient?: string | undefined;
        brightness?: number | undefined;
        shadows?: boolean | undefined;
        colorShift?: {
            top?: string | undefined;
            bottom?: string | undefined;
        } | undefined;
    }, {
        time?: number | undefined;
        ambient?: string | undefined;
        brightness?: number | undefined;
        shadows?: boolean | undefined;
        colorShift?: {
            top?: string | undefined;
            bottom?: string | undefined;
        } | undefined;
    }>>;
    fog: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodOptional<z.ZodBoolean>;
        start: z.ZodOptional<z.ZodNumber>;
        end: z.ZodOptional<z.ZodNumber>;
        color: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean | undefined;
        end?: number | undefined;
        color?: string | undefined;
        start?: number | undefined;
    }, {
        enabled?: boolean | undefined;
        end?: number | undefined;
        color?: string | undefined;
        start?: number | undefined;
    }>>;
    atmosphere: z.ZodOptional<z.ZodObject<{
        density: z.ZodOptional<z.ZodNumber>;
        offset: z.ZodOptional<z.ZodNumber>;
        color: z.ZodOptional<z.ZodString>;
        glare: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        offset?: number | undefined;
        color?: string | undefined;
        density?: number | undefined;
        glare?: number | undefined;
    }, {
        offset?: number | undefined;
        color?: string | undefined;
        density?: number | undefined;
        glare?: number | undefined;
    }>>;
    soundscape: z.ZodOptional<z.ZodArray<z.ZodObject<{
        soundId: z.ZodString;
        looped: z.ZodOptional<z.ZodBoolean>;
        volume: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        soundId: string;
        looped?: boolean | undefined;
        volume?: number | undefined;
    }, {
        soundId: string;
        looped?: boolean | undefined;
        volume?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    lighting?: {
        time?: number | undefined;
        ambient?: string | undefined;
        brightness?: number | undefined;
        shadows?: boolean | undefined;
        colorShift?: {
            top?: string | undefined;
            bottom?: string | undefined;
        } | undefined;
    } | undefined;
    fog?: {
        enabled?: boolean | undefined;
        end?: number | undefined;
        color?: string | undefined;
        start?: number | undefined;
    } | undefined;
    atmosphere?: {
        offset?: number | undefined;
        color?: string | undefined;
        density?: number | undefined;
        glare?: number | undefined;
    } | undefined;
    soundscape?: {
        soundId: string;
        looped?: boolean | undefined;
        volume?: number | undefined;
    }[] | undefined;
}, {
    lighting?: {
        time?: number | undefined;
        ambient?: string | undefined;
        brightness?: number | undefined;
        shadows?: boolean | undefined;
        colorShift?: {
            top?: string | undefined;
            bottom?: string | undefined;
        } | undefined;
    } | undefined;
    fog?: {
        enabled?: boolean | undefined;
        end?: number | undefined;
        color?: string | undefined;
        start?: number | undefined;
    } | undefined;
    atmosphere?: {
        offset?: number | undefined;
        color?: string | undefined;
        density?: number | undefined;
        glare?: number | undefined;
    } | undefined;
    soundscape?: {
        soundId: string;
        looped?: boolean | undefined;
        volume?: number | undefined;
    }[] | undefined;
}>;
