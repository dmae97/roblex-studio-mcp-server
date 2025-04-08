import { z } from 'zod';
import { McpTool } from '@modelcontextprotocol/sdk/server/index.js';
declare const OpenCloudConnectorParamsSchema: z.ZodObject<{
    feature: z.ZodEnum<["DataStores", "MessagingService", "PlacePublishing", "GameConfig", "PlayerModeration", "Analytics", "PlaceManagement"]>;
    universeId: z.ZodOptional<z.ZodString>;
    actionType: z.ZodEnum<["get", "list", "create", "update", "delete", "publish", "message", "moderate", "query"]>;
    parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    forceRefresh: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    feature: "DataStores" | "MessagingService" | "PlacePublishing" | "GameConfig" | "PlayerModeration" | "Analytics" | "PlaceManagement";
    actionType: "message" | "list" | "get" | "delete" | "query" | "create" | "update" | "publish" | "moderate";
    forceRefresh: boolean;
    universeId?: string | undefined;
    parameters?: Record<string, any> | undefined;
}, {
    feature: "DataStores" | "MessagingService" | "PlacePublishing" | "GameConfig" | "PlayerModeration" | "Analytics" | "PlaceManagement";
    actionType: "message" | "list" | "get" | "delete" | "query" | "create" | "update" | "publish" | "moderate";
    universeId?: string | undefined;
    parameters?: Record<string, any> | undefined;
    forceRefresh?: boolean | undefined;
}>;
type OpenCloudConnectorParams = z.infer<typeof OpenCloudConnectorParamsSchema>;
/**
 * Provides access to Roblox Open Cloud API features
 */
export declare const openCloudConnector: McpTool<OpenCloudConnectorParams>;
export {};
