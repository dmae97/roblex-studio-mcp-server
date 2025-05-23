import { logger } from '../utils/logger.js';

/**
 * Client for interacting with the Roblex Studio API
 */
export class RoblexApiClient {
  private apiBaseUrl: string;
  private apiKey: string;
  
  /**
   * Create a new Roblex API client
   * @param apiBaseUrl Base URL for the Roblex API
   * @param apiKey API key for authentication
   */
  constructor(apiBaseUrl: string, apiKey: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.apiKey = apiKey;
    
    logger.info('Roblex API client initialized');
  }
  
  /**
   * Make an authenticated request to the Roblex API
   * @param endpoint API endpoint
   * @param method HTTP method
   * @param body Request body (for POST/PUT/PATCH)
   * @returns Response data
   */
  private async request<T>(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any): Promise<T> {
    const url = `${this.apiBaseUrl}${endpoint}`;
    
    try {
      const headers: HeadersInit = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      const options: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      };
      
      logger.debug(`Making ${method} request to ${url}`);
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Roblex API error (${response.status}): ${errorText}`);
        throw new Error(`Roblex API error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      return data as T;
    } catch (error) {
      logger.error(`Error communicating with Roblex API: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Get information about an asset
   * @param assetId ID of the asset
   * @returns Asset information
   */
  async getAsset(assetId: string): Promise<any> {
    return this.request(`/assets/${assetId}`);
  }
  
  /**
   * Search for assets
   * @param query Search query
   * @param assetType Type of asset to search for
   * @param limit Maximum number of results
   * @param offset Pagination offset
   * @returns Search results
   */
  async searchAssets(query: string, assetType?: string, limit: number = 50, offset: number = 0): Promise<any> {
    const params = new URLSearchParams();
    
    params.append('q', query);
    
    if (assetType) {
      params.append('type', assetType);
    }
    
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    return this.request(`/assets?${params.toString()}`);
  }
  
  /**
   * Upload a new asset
   * @param assetData Asset data including name, description, and file content
   * @returns Created asset information
   */
  async uploadAsset(assetData: { name: string; description?: string; type: string; content: string; }): Promise<any> {
    return this.request('/assets', 'POST', assetData);
  }
  
  /**
   * Get a script by ID
   * @param scriptId ID of the script
   * @returns Script data
   */
  async getScript(scriptId: string): Promise<any> {
    return this.request(`/scripts/${scriptId}`);
  }
  
  /**
   * Create a new script
   * @param scriptData Script data including name, type, and content
   * @returns Created script information
   */
  async createScript(scriptData: { name: string; type: string; content: string; parentId?: string; }): Promise<any> {
    return this.request('/scripts', 'POST', scriptData);
  }
  
  /**
   * Update an existing script
   * @param scriptId ID of the script to update
   * @param scriptData Script data to update
   * @returns Updated script information
   */
  async updateScript(scriptId: string, scriptData: { name?: string; content?: string; }): Promise<any> {
    return this.request(`/scripts/${scriptId}`, 'PUT', scriptData);
  }
  
  /**
   * Validate a script without creating it
   * @param scriptData Script data to validate
   * @returns Validation results
   */
  async validateScript(scriptData: { content: string; type: string; }): Promise<any> {
    return this.request('/scripts/validate', 'POST', scriptData);
  }
  
  /**
   * Get user profile
   * @param userId ID of the user
   * @returns User profile information
   */
  async getUserProfile(userId: string): Promise<any> {
    return this.request(`/users/${userId}/profile`);
  }
}

/**
 * Create a Roblex API client with credentials from environment variables
 * @returns Configured Roblex API client
 */
export function createRoblexApiClient(): RoblexApiClient {
  const apiBaseUrl = process.env.ROBLEX_API_BASE_URL || 'https://api.roblexstudio.com/v1';
  const apiKey = process.env.ROBLEX_API_KEY || '';
  
  if (!apiKey) {
    logger.warn('No Roblex API key provided, API calls will likely fail');
  }
  
  return new RoblexApiClient(apiBaseUrl, apiKey);
}
