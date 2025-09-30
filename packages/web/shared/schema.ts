/* File Overview
  Path: shared/schema.ts
  Purpose: Central definition of database tables, relations, and Zod-powered insert schemas.
  Shared between server and client to keep types in sync.

  Reading tip for newcomers:
  - Each pgTable(...) defines the shape of a table, its columns, and defaults
  - The createInsertSchema(...) helpers derive Zod validators from the table definitions
*/

import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, uuid, pgEnum, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["client", "startup", "admin"]);
export const toolStatusEnum = pgEnum("tool_status", ["pending", "approved", "rejected"]);
export const pricingModelEnum = pgEnum("pricing_model", ["free", "freemium", "paid", "enterprise"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email").unique().notNull(),
  password: text("password").notNull(),
  name: varchar("name"),
  role: userRoleEnum("role").default("client").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// AI Tools table
export const aiTools = pgTable("ai_tools", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  description: text("description"),
  oneLiner: varchar("one_liner", { length: 200 }),
  websiteUrl: varchar("website_url"),
  pricingModel: pricingModelEnum("pricing_model"),
  pricingDetails: jsonb("pricing_details"),
  features: text("features").array(),
  industries: text("industries").array(),
  integrations: text("integrations").array(),
  techStack: text("tech_stack").array(),
  demoVideoUrl: varchar("demo_video_url"),
  logoUrl: varchar("logo_url"),
  startupId: uuid("startup_id").references(() => users.id).notNull(),
  status: toolStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Tool embeddings for semantic search (future implementation)
export const toolEmbeddings = pgTable("tool_embeddings", {
  id: uuid("id").primaryKey().defaultRandom(),
  toolId: uuid("tool_id").references(() => aiTools.id).notNull(),
  embedding: text("embedding"), // Will store as JSON string for now
  metadata: jsonb("metadata")
});

// User searches and interactions
export const searchQueries = pgTable("search_queries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  query: text("query").notNull(),
  resultsShown: integer("results_shown"),
  clickedTools: uuid("clicked_tools").array(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Analytics for startups
export const toolAnalytics = pgTable("tool_analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  toolId: uuid("tool_id").references(() => aiTools.id).notNull(),
  date: timestamp("date").notNull(),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  contactRequests: integer("contact_requests").default(0)
});

// Contact requests
export const contactRequests = pgTable("contact_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  toolId: uuid("tool_id").references(() => aiTools.id).notNull(),
  clientId: uuid("client_id").references(() => users.id).notNull(),
  message: text("message"),
  clientEmail: varchar("client_email"),
  clientName: varchar("client_name"),
  status: varchar("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tools: many(aiTools),
  searches: many(searchQueries),
  contactRequests: many(contactRequests)
}));

export const aiToolsRelations = relations(aiTools, ({ one, many }) => ({
  startup: one(users, {
    fields: [aiTools.startupId],
    references: [users.id]
  }),
  embeddings: many(toolEmbeddings),
  analytics: many(toolAnalytics),
  contactRequests: many(contactRequests)
}));

export const toolEmbeddingsRelations = relations(toolEmbeddings, ({ one }) => ({
  tool: one(aiTools, {
    fields: [toolEmbeddings.toolId],
    references: [aiTools.id]
  })
}));

export const searchQueriesRelations = relations(searchQueries, ({ one }) => ({
  user: one(users, {
    fields: [searchQueries.userId],
    references: [users.id]
  })
}));

export const toolAnalyticsRelations = relations(toolAnalytics, ({ one }) => ({
  tool: one(aiTools, {
    fields: [toolAnalytics.toolId],
    references: [aiTools.id]
  })
}));

export const contactRequestsRelations = relations(contactRequests, ({ one }) => ({
  tool: one(aiTools, {
    fields: [contactRequests.toolId],
    references: [aiTools.id]
  }),
  client: one(users, {
    fields: [contactRequests.clientId],
    references: [users.id]
  })
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertAiToolSchema = createInsertSchema(aiTools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true
});

export const insertContactRequestSchema = createInsertSchema(contactRequests).omit({
  id: true,
  createdAt: true,
  status: true
});

export const insertSearchQuerySchema = createInsertSchema(searchQueries).omit({
  id: true,
  createdAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type AiTool = typeof aiTools.$inferSelect;
export type InsertAiTool = typeof aiTools.$inferInsert;

export type ContactRequest = typeof contactRequests.$inferSelect;
export type InsertContactRequest = typeof contactRequests.$inferInsert;

export type SearchQuery = typeof searchQueries.$inferSelect;
export type InsertSearchQuery = typeof searchQueries.$inferInsert;

export type ToolAnalytics = typeof toolAnalytics.$inferSelect;
export type InsertToolAnalytics = typeof toolAnalytics.$inferInsert;
