import { z } from 'zod';
import { McpTool } from '@modelcontextprotocol/sdk/server/index.js';
declare const DataStoreManagerParamsSchema: z.ZodObject<{
    datastoreName: z.ZodString;
    dataStructure: z.ZodString;
    sessionCaching: z.ZodDefault<z.ZodBoolean>;
    backupStrategy: z.ZodDefault<z.ZodEnum<["none", "periodic", "onError"]>>;
    playerData: z.ZodDefault<z.ZodBoolean>;
    customKeys: z.ZodDefault<z.ZodBoolean>;
    keyFormat: z.ZodOptional<z.ZodString>;
    asyncWrites: z.ZodDefault<z.ZodBoolean>;
    throttlingStrategy: z.ZodDefault<z.ZodEnum<["none", "exponentialBackoff", "fixedInterval"]>>;
}, "strip", z.ZodTypeAny, {
    datastoreName: string;
    dataStructure: string;
    sessionCaching: boolean;
    backupStrategy: "none" | "periodic" | "onError";
    playerData: boolean;
    customKeys: boolean;
    asyncWrites: boolean;
    throttlingStrategy: "none" | "exponentialBackoff" | "fixedInterval";
    keyFormat?: string | undefined;
}, {
    datastoreName: string;
    dataStructure: string;
    sessionCaching?: boolean | undefined;
    backupStrategy?: "none" | "periodic" | "onError" | undefined;
    playerData?: boolean | undefined;
    customKeys?: boolean | undefined;
    keyFormat?: string | undefined;
    asyncWrites?: boolean | undefined;
    throttlingStrategy?: "none" | "exponentialBackoff" | "fixedInterval" | undefined;
}>;
type DataStoreManagerParams = z.infer<typeof DataStoreManagerParamsSchema>;
/**
 * Creates a DataStore system for Roblox games
 */
export declare const datastoreManager: McpTool<DataStoreManagerParams>;
export {};
