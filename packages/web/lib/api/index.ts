/**
 * API Module
 * 
 * Centralized API client and endpoint definitions for the Quantize application.
 * Provides type-safe HTTP requests and consistent error handling.
 * 
 * @module lib/api
 */

export { apiClient, api, ApiError } from './client';
export type { HttpMethod, ApiRequestConfig } from './client';
export { endpoints } from './endpoints';
