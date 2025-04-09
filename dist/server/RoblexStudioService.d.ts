import { Router } from 'express';
import { RoblexStudioSequentialMcp } from './RoblexStudioSequentialMcp.js';
/**
 * Service options
 */
export interface RoblexStudioServiceOptions {
    version: string;
    apiPrefix?: string;
    concurrency?: number;
}
/**
 * Roblox Studio Service
 * Manages MCP server, endpoints, and connections for Roblox Studio
 */
export declare class RoblexStudioService {
    private _name;
    private _version;
    private _apiPrefix;
    private _concurrency;
    private _server;
    private _router;
    private _transports;
    /**
     * Create a new Roblox Studio service
     * @param options Service options
     */
    constructor(options: RoblexStudioServiceOptions);
    /**
     * Get the Express router
     */
    get router(): Router;
    /**
     * Setup Express routes
     */
    private _setupRoutes;
    /**
     * Handle SSE connection
     * @param req Express request
     * @param res Express response
     */
    private _handleSSEConnection;
    /**
     * Handle SSE disconnection
     * @param sessionId Session ID to disconnect
     */
    private _handleSSEDisconnection;
    /**
     * Handle message from client
     * @param req Express request
     * @param res Express response
     */
    private _handleMessage;
    /**
     * Handle explicit disconnect request
     * @param req Express request
     * @param res Express response
     */
    private _handleDisconnect;
    /**
     * Get the MCP server
     */
    get server(): RoblexStudioSequentialMcp;
    /**
     * Shutdown the service
     */
    shutdown(): Promise<void>;
}
