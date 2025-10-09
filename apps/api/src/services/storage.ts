/* File Overview
  Path: server/storage.ts
  Purpose: Provides a unified storage interface (IStorage) using in-memory storage
  for local development and testing.

  Reading tip for newcomers:
  - Focus on the IStorage interface to understand available data operations
  - Uses memory storage for all data operations
*/

import {
  type User,
  type InsertUser,
  type AiTool,
  type InsertAiTool,
  type ContactRequest,
  type InsertContactRequest,
  type SearchQuery,
  type InsertSearchQuery,
  type ToolAnalytics
} from "../../../../packages/shared/schemas/schema";

// Import memory storage
import { MemoryStorage } from "./storage.memory";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(email: string, password: string): Promise<User | null>;

  // Tool management
  getTools(filters?: {
    status?: string;
    search?: string;
    industries?: string[];
    pricingModel?: string;
  }): Promise<AiTool[]>;
  getTool(id: string): Promise<AiTool | undefined>;
  getToolsByStartup(startupId: string): Promise<AiTool[]>;
  createTool(tool: InsertAiTool): Promise<AiTool>;
  updateTool(id: string, updates: Partial<AiTool>): Promise<AiTool>;
  deleteTool(id: string): Promise<void>;

  // Admin functions
  getPendingTools(): Promise<AiTool[]>;
  approveTool(id: string): Promise<void>;
  rejectTool(id: string): Promise<void>;

  // Contact requests
  createContactRequest(request: InsertContactRequest): Promise<ContactRequest>;
  getContactRequestsForStartup(startupId: string): Promise<ContactRequest[]>;

  // Search and analytics
  recordSearch(search: InsertSearchQuery): Promise<SearchQuery>;
  getSearchAnalytics(startupId?: string): Promise<any>;
  recordToolView(toolId: string): Promise<void>;
  recordToolClick(toolId: string): Promise<void>;
  getToolAnalytics(toolId: string): Promise<ToolAnalytics[]>;
}

// Use memory storage for all operations
export const storage = new MemoryStorage();
