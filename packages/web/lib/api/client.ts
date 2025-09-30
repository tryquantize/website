/**
 * API Client
 * 
 * Centralized API client for making HTTP requests to backend services.
 * Provides a unified interface for all API calls with error handling and type safety.
 * 
 * @module lib/api/client
 */

/**
 * HTTP Methods supported by the API client
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Configuration options for API requests
 */
export interface ApiRequestConfig {
  /** HTTP method for the request */
  method?: HttpMethod;
  /** Request body data */
  body?: any;
  /** Additional headers to include */
  headers?: Record<string, string>;
  /** Query parameters to append to URL */
  params?: Record<string, string | number | boolean>;
}

/**
 * API Error class for structured error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Make an HTTP request to the API
 * 
 * @param {string} endpoint - API endpoint path (e.g., '/api/tools')
 * @param {ApiRequestConfig} config - Request configuration
 * @returns {Promise<T>} Response data
 * @throws {ApiError} If the request fails
 * 
 * @example
 * // GET request
 * const tools = await apiClient('/api/tools');
 * 
 * // POST request
 * const newTool = await apiClient('/api/tools', {
 *   method: 'POST',
 *   body: { name: 'My Tool', description: '...' }
 * });
 * 
 * // With query parameters
 * const filtered = await apiClient('/api/tools', {
 *   params: { category: 'ai', limit: 10 }
 * });
 */
export async function apiClient<T = any>(
  endpoint: string,
  config: ApiRequestConfig = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    params = {},
  } = config;

  // Build URL with query parameters
  const url = new URL(endpoint, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  // Prepare request options
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  // Add body for POST/PUT/PATCH requests
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url.toString(), options);

    // Parse response
    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle errors
    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Wrap other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'An unknown error occurred',
      0
    );
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  /**
   * Make a GET request
   */
  get: <T = any>(endpoint: string, params?: Record<string, any>) =>
    apiClient<T>(endpoint, { method: 'GET', params }),

  /**
   * Make a POST request
   */
  post: <T = any>(endpoint: string, body?: any) =>
    apiClient<T>(endpoint, { method: 'POST', body }),

  /**
   * Make a PUT request
   */
  put: <T = any>(endpoint: string, body?: any) =>
    apiClient<T>(endpoint, { method: 'PUT', body }),

  /**
   * Make a PATCH request
   */
  patch: <T = any>(endpoint: string, body?: any) =>
    apiClient<T>(endpoint, { method: 'PATCH', body }),

  /**
   * Make a DELETE request
   */
  delete: <T = any>(endpoint: string) =>
    apiClient<T>(endpoint, { method: 'DELETE' }),
};
