import { z } from 'zod';
import { McpTool } from '@modelcontextprotocol/sdk/server/index.js';
declare const UIBuilderParamsSchema: z.ZodObject<{
    uiType: z.ZodEnum<["Menu", "HUD", "Dialog", "Inventory", "Shop", "Leaderboard", "Settings", "Loading", "Custom"]>;
    elements: z.ZodArray<z.ZodString, "many">;
    responsive: z.ZodDefault<z.ZodBoolean>;
    stylePreset: z.ZodDefault<z.ZodEnum<["Modern", "Retro", "Minimalist", "Fantasy", "SciFi", "Custom"]>>;
    layout: z.ZodDefault<z.ZodEnum<["Grid", "List", "Flex", "Absolute", "Mixed"]>>;
    animations: z.ZodDefault<z.ZodBoolean>;
    useRoactComponents: z.ZodDefault<z.ZodBoolean>;
    colorScheme: z.ZodOptional<z.ZodObject<{
        primary: z.ZodOptional<z.ZodString>;
        secondary: z.ZodOptional<z.ZodString>;
        background: z.ZodOptional<z.ZodString>;
        text: z.ZodOptional<z.ZodString>;
        accent: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        text?: string | undefined;
        primary?: string | undefined;
        secondary?: string | undefined;
        background?: string | undefined;
        accent?: string | undefined;
    }, {
        text?: string | undefined;
        primary?: string | undefined;
        secondary?: string | undefined;
        background?: string | undefined;
        accent?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    uiType: "Custom" | "Menu" | "HUD" | "Dialog" | "Inventory" | "Shop" | "Leaderboard" | "Settings" | "Loading";
    elements: string[];
    responsive: boolean;
    stylePreset: "Custom" | "Modern" | "Retro" | "Minimalist" | "Fantasy" | "SciFi";
    layout: "Grid" | "List" | "Flex" | "Absolute" | "Mixed";
    animations: boolean;
    useRoactComponents: boolean;
    colorScheme?: {
        text?: string | undefined;
        primary?: string | undefined;
        secondary?: string | undefined;
        background?: string | undefined;
        accent?: string | undefined;
    } | undefined;
}, {
    uiType: "Custom" | "Menu" | "HUD" | "Dialog" | "Inventory" | "Shop" | "Leaderboard" | "Settings" | "Loading";
    elements: string[];
    responsive?: boolean | undefined;
    stylePreset?: "Custom" | "Modern" | "Retro" | "Minimalist" | "Fantasy" | "SciFi" | undefined;
    layout?: "Grid" | "List" | "Flex" | "Absolute" | "Mixed" | undefined;
    animations?: boolean | undefined;
    useRoactComponents?: boolean | undefined;
    colorScheme?: {
        text?: string | undefined;
        primary?: string | undefined;
        secondary?: string | undefined;
        background?: string | undefined;
        accent?: string | undefined;
    } | undefined;
}>;
type UIBuilderParams = z.infer<typeof UIBuilderParamsSchema>;
/**
 * Creates UI systems for Roblox games
 */
export declare const uiBuilder: McpTool<UIBuilderParams>;
export {};
