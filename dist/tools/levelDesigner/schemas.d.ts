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
        weather?: "custom" | "clear" | "fog" | "rain" | "snow";
        gravity?: number;
        lighting?: "custom" | "day" | "night" | "dawn" | "dusk";
        ambientSounds?: string[];
    }, {
        weather?: "custom" | "clear" | "fog" | "rain" | "snow";
        gravity?: number;
        lighting?: "custom" | "day" | "night" | "dawn" | "dusk";
        ambientSounds?: string[];
    }>>;
}, "strip", z.ZodTypeAny, {
    size?: "custom" | "small" | "medium" | "large";
    levelType?: "custom" | "platformer" | "maze" | "open-world" | "tower-defense" | "obstacle-course" | "racing";
    includePlayerSpawns?: boolean;
    includeCheckpoints?: boolean;
    theme?: string;
    difficulty?: "medium" | "easy" | "hard" | "expert";
    features?: string[];
    customParameters?: Record<string, string>;
    environmentSettings?: {
        weather?: "custom" | "clear" | "fog" | "rain" | "snow";
        gravity?: number;
        lighting?: "custom" | "day" | "night" | "dawn" | "dusk";
        ambientSounds?: string[];
    };
}, {
    size?: "custom" | "small" | "medium" | "large";
    levelType?: "custom" | "platformer" | "maze" | "open-world" | "tower-defense" | "obstacle-course" | "racing";
    includePlayerSpawns?: boolean;
    includeCheckpoints?: boolean;
    theme?: string;
    difficulty?: "medium" | "easy" | "hard" | "expert";
    features?: string[];
    customParameters?: Record<string, string>;
    environmentSettings?: {
        weather?: "custom" | "clear" | "fog" | "rain" | "snow";
        gravity?: number;
        lighting?: "custom" | "day" | "night" | "dawn" | "dusk";
        ambientSounds?: string[];
    };
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
        x?: number;
        y?: number;
        z?: number;
    }, {
        x?: number;
        y?: number;
        z?: number;
    }>;
    detailLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    seed: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    size?: {
        x?: number;
        y?: number;
        z?: number;
    };
    terrainType?: "flat" | "custom" | "hills" | "mountains" | "islands" | "caves";
    waterEnabled?: boolean;
    materialSettings?: Record<string, string>;
    detailLevel?: "low" | "medium" | "high";
    seed?: number;
}, {
    size?: {
        x?: number;
        y?: number;
        z?: number;
    };
    terrainType?: "flat" | "custom" | "hills" | "mountains" | "islands" | "caves";
    waterEnabled?: boolean;
    materialSettings?: Record<string, string>;
    detailLevel?: "low" | "medium" | "high";
    seed?: number;
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
            top?: string;
            bottom?: string;
        }, {
            top?: string;
            bottom?: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        time?: number;
        ambient?: string;
        brightness?: number;
        shadows?: boolean;
        colorShift?: {
            top?: string;
            bottom?: string;
        };
    }, {
        time?: number;
        ambient?: string;
        brightness?: number;
        shadows?: boolean;
        colorShift?: {
            top?: string;
            bottom?: string;
        };
    }>>;
    fog: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodOptional<z.ZodBoolean>;
        start: z.ZodOptional<z.ZodNumber>;
        end: z.ZodOptional<z.ZodNumber>;
        color: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean;
        end?: number;
        color?: string;
        start?: number;
    }, {
        enabled?: boolean;
        end?: number;
        color?: string;
        start?: number;
    }>>;
    atmosphere: z.ZodOptional<z.ZodObject<{
        density: z.ZodOptional<z.ZodNumber>;
        offset: z.ZodOptional<z.ZodNumber>;
        color: z.ZodOptional<z.ZodString>;
        glare: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        offset?: number;
        density?: number;
        color?: string;
        glare?: number;
    }, {
        offset?: number;
        density?: number;
        color?: string;
        glare?: number;
    }>>;
    soundscape: z.ZodOptional<z.ZodArray<z.ZodObject<{
        soundId: z.ZodString;
        looped: z.ZodOptional<z.ZodBoolean>;
        volume: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        soundId?: string;
        looped?: boolean;
        volume?: number;
    }, {
        soundId?: string;
        looped?: boolean;
        volume?: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    lighting?: {
        time?: number;
        ambient?: string;
        brightness?: number;
        shadows?: boolean;
        colorShift?: {
            top?: string;
            bottom?: string;
        };
    };
    fog?: {
        enabled?: boolean;
        end?: number;
        color?: string;
        start?: number;
    };
    atmosphere?: {
        offset?: number;
        density?: number;
        color?: string;
        glare?: number;
    };
    soundscape?: {
        soundId?: string;
        looped?: boolean;
        volume?: number;
    }[];
}, {
    lighting?: {
        time?: number;
        ambient?: string;
        brightness?: number;
        shadows?: boolean;
        colorShift?: {
            top?: string;
            bottom?: string;
        };
    };
    fog?: {
        enabled?: boolean;
        end?: number;
        color?: string;
        start?: number;
    };
    atmosphere?: {
        offset?: number;
        density?: number;
        color?: string;
        glare?: number;
    };
    soundscape?: {
        soundId?: string;
        looped?: boolean;
        volume?: number;
    }[];
}>;
