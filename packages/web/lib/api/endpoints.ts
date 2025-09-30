/**
 * API Endpoints
 * 
 * Centralized definition of all API endpoints used in the application.
 * Provides type-safe endpoint construction and consistent API paths.
 * 
 * @module lib/api/endpoints
 */

/**
 * Base API path
 */
const API_BASE = '/api';

/**
 * Tool/Product endpoints
 */
export const toolsEndpoints = {
  /** Get all tools */
  list: () => `${API_BASE}/tools`,
  
  /** Get a specific tool by ID */
  get: (id: string) => `${API_BASE}/tools/${id}`,
  
  /** Create a new tool */
  create: () => `${API_BASE}/tools`,
  
  /** Update a tool */
  update: (id: string) => `${API_BASE}/tools/${id}`,
  
  /** Delete a tool */
  delete: (id: string) => `${API_BASE}/tools/${id}`,
  
  /** Track a click on a tool */
  trackClick: (id: string) => `${API_BASE}/tools/${id}/click`,
} as const;

/**
 * Search endpoints
 */
export const searchEndpoints = {
  /** Search for tools */
  search: () => `${API_BASE}/search`,
  
  /** Get search suggestions */
  suggestions: () => `${API_BASE}/search/suggestions`,
} as const;

/**
 * Authentication endpoints
 */
export const authEndpoints = {
  /** Login user */
  login: () => `${API_BASE}/auth/login`,
  
  /** Register new user */
  register: () => `${API_BASE}/auth/register`,
  
  /** Logout user */
  logout: () => `${API_BASE}/auth/logout`,
  
  /** Get current user */
  me: () => `${API_BASE}/auth/me`,
} as const;

/**
 * Contact request endpoints
 */
export const contactEndpoints = {
  /** Create a contact request */
  create: () => `${API_BASE}/contact-requests`,
  
  /** List contact requests (admin) */
  list: () => `${API_BASE}/contact-requests`,
} as const;

/**
 * Waitlist endpoints
 */
export const waitlistEndpoints = {
  /** Add user to waitlist */
  join: () => `${API_BASE}/waitlist`,
  
  /** Get waitlist count */
  count: () => `${API_BASE}/waitlist/count`,
} as const;

/**
 * Admin endpoints
 */
export const adminEndpoints = {
  /** Get all tools (admin) */
  tools: () => `${API_BASE}/admin/tools`,
  
  /** Approve a tool */
  approveTool: (id: string) => `${API_BASE}/admin/tools/${id}/approve`,
  
  /** Reject a tool */
  rejectTool: (id: string) => `${API_BASE}/admin/tools/${id}/reject`,
} as const;

/**
 * All API endpoints grouped by feature
 */
export const endpoints = {
  tools: toolsEndpoints,
  search: searchEndpoints,
  auth: authEndpoints,
  contact: contactEndpoints,
  waitlist: waitlistEndpoints,
  admin: adminEndpoints,
} as const;
