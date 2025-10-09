/* File Overview
  Path: shared/schema.ts
  Purpose: Central definition of data types and Zod validation schemas.
  Shared between server and client to keep types in sync.

  Reading tip for newcomers:
  - Each interface defines the shape of a data entity
  - Zod schemas provide runtime validation
*/

import { z } from "zod";

// Enums
export type UserRole = "client" | "startup" | "admin";
export type ToolStatus = "pending" | "approved" | "rejected";
export type PricingModel = "free" | "freemium" | "paid" | "enterprise";

// User interface
export interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// AI Tool interface
export interface AiTool {
  id: string;
  name: string;
  description?: string;
  oneLiner?: string;
  websiteUrl?: string;
  pricingModel?: PricingModel;
  pricingDetails?: any;
  features?: string[];
  industries?: string[];
  integrations?: string[];
  techStack?: string[];
  demoVideoUrl?: string;
  logoUrl?: string;
  startupId: string;
  status: ToolStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Tool embeddings interface
export interface ToolEmbedding {
  id: string;
  toolId: string;
  embedding?: string;
  metadata?: any;
}

// Search query interface
export interface SearchQuery {
  id: string;
  userId?: string;
  query: string;
  resultsShown?: number;
  clickedTools?: string[];
  createdAt: Date;
}

// Tool analytics interface
export interface ToolAnalytics {
  id: string;
  toolId: string;
  date: Date;
  impressions: number;
  clicks: number;
  contactRequests: number;
}

// Contact request interface
export interface ContactRequest {
  id: string;
  toolId: string;
  clientId: string;
  message?: string;
  clientEmail?: string;
  clientName?: string;
  status: string;
  createdAt: Date;
}



// Insert schemas
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  role: z.enum(["client", "startup", "admin"]).default("client")
});

export const insertAiToolSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  oneLiner: z.string().max(200).optional(),
  websiteUrl: z.string().url().optional(),
  pricingModel: z.enum(["free", "freemium", "paid", "enterprise"]).optional(),
  pricingDetails: z.any().optional(),
  features: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  integrations: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
  demoVideoUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  startupId: z.string()
});

export const insertContactRequestSchema = z.object({
  toolId: z.string(),
  clientId: z.string(),
  message: z.string().optional(),
  clientEmail: z.string().email().optional(),
  clientName: z.string().optional()
});

export const insertSearchQuerySchema = z.object({
  userId: z.string().optional(),
  query: z.string(),
  resultsShown: z.number().optional(),
  clickedTools: z.array(z.string()).optional()
});

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAiTool = z.infer<typeof insertAiToolSchema>;
export type InsertContactRequest = z.infer<typeof insertContactRequestSchema>;
export type InsertSearchQuery = z.infer<typeof insertSearchQuerySchema>;
