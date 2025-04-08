/**
 * Client for interacting with the Roblex Studio API
 */
export declare class RoblexApiClient {
    private apiBaseUrl;
    private apiKey;
    /**
     * Create a new Roblex API client
     * @param apiBaseUrl Base URL for the Roblex API
     * @param apiKey API key for authentication
     */
    constructor(apiBaseUrl: string, apiKey: string);
    /**
     * Make an authenticated request to the Roblex API
     * @param endpoint API endpoint
     * @param method HTTP method
     * @param body Request body (for POST/PUT/PATCH)
     * @returns Response data
     */
    private request;
    /**
     * Get information about an asset
     * @param assetId ID of the asset
     * @returns Asset information
     */
    getAsset(assetId: string): Promise<any>;
    /**
     * Search for assets
     * @param query Search query
     * @param assetType Type of asset to search for
     * @param limit Maximum number of results
     * @param offset Pagination offset
     * @returns Search results
     */
    searchAssets(query: string, assetType?: string, limit?: number, offset?: number): Promise<any>;
    /**
     * Upload a new asset
     * @param assetData Asset data including name, description, and file content
     * @returns Created asset information
     */
    uploadAsset(assetData: {
        name: string;
        description?: string;
        type: string;
        content: string;
    }): Promise<any>;
    /**
     * Get a script by ID
     * @param scriptId ID of the script
     * @returns Script data
     */
    getScript(scriptId: string): Promise<any>;
    /**
     * Create a new script
     * @param scriptData Script data including name, type, and content
     * @returns Created script information
     */
    createScript(scriptData: {
        name: string;
        type: string;
        content: string;
        parentId?: string;
    }): Promise<any>;
    /**
     * Update an existing script
     * @param scriptId ID of the script to update
     * @param scriptData Script data to update
     * @returns Updated script information
     */
    updateScript(scriptId: string, scriptData: {
        name?: string;
        content?: string;
    }): Promise<any>;
    /**
     * Validate a script without creating it
     * @param scriptData Script data to validate
     * @returns Validation results
     */
    validateScript(scriptData: {
        content: string;
        type: string;
    }): Promise<any>;
    /**
     * Get user profile
     * @param userId ID of the user
     * @returns User profile information
     */
    getUserProfile(userId: string): Promise<any>;
}
/**
 * Create a Roblex API client with credentials from environment variables
 * @returns Configured Roblex API client
 */
export declare function createRoblexApiClient(): RoblexApiClient;
