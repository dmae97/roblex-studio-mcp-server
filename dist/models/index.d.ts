/**
 * Models and adapters for Roblex Studio MCP Server
 */
export declare const globalContext: {
    getAllModels: () => never[];
};
export declare const globalProtocol: {
    version: string;
};
/**
 * Factory function to create a Roblex Studio adapter
 */
export declare function roblexStudioAdapterFactory(sessionId: string): {
    /**
     * Connect the adapter to Roblex Studio
     */
    connect: () => boolean;
    /**
     * Disconnect the adapter from Roblex Studio
     */
    disconnect: () => boolean;
    /**
     * Handle incoming message from Roblex Studio
     */
    handleMessage: (messageType: string, data: any) => Promise<{
        success: boolean;
    }>;
    /**
     * Connection status
     */
    isConnected: boolean;
};
