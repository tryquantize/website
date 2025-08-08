import {
  users,
  aiTools,
  contactRequests,
  searchQueries,
  toolAnalytics,
  type User,
  type InsertUser,
  type AiTool,
  type InsertAiTool,
  type ContactRequest,
  type InsertContactRequest,
  type SearchQuery,
  type InsertSearchQuery,
  type ToolAnalytics
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, sql, count } from "drizzle-orm";
import bcrypt from "bcryptjs";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword
      })
      .returning();
    return user;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async getTools(filters?: {
    status?: string;
    search?: string;
    industries?: string[];
    pricingModel?: string;
  }): Promise<AiTool[]> {
    let query = db.select().from(aiTools);
    
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(aiTools.status, filters.status as any));
    } else {
      conditions.push(eq(aiTools.status, "approved"));
    }

    if (filters?.search) {
      conditions.push(
        sql`${aiTools.name} ILIKE ${`%${filters.search}%`} OR ${aiTools.description} ILIKE ${`%${filters.search}%`}`
      );
    }

    if (filters?.pricingModel) {
      conditions.push(eq(aiTools.pricingModel, filters.pricingModel as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(desc(aiTools.createdAt));
    return results;
  }

  async getTool(id: string): Promise<AiTool | undefined> {
    const [tool] = await db.select().from(aiTools).where(eq(aiTools.id, id));
    return tool || undefined;
  }

  async getToolsByStartup(startupId: string): Promise<AiTool[]> {
    return await db.select().from(aiTools)
      .where(eq(aiTools.startupId, startupId))
      .orderBy(desc(aiTools.createdAt));
  }

  async createTool(tool: InsertAiTool): Promise<AiTool> {
    const [createdTool] = await db
      .insert(aiTools)
      .values(tool)
      .returning();
    return createdTool;
  }

  async updateTool(id: string, updates: Partial<AiTool>): Promise<AiTool> {
    const [updatedTool] = await db
      .update(aiTools)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(aiTools.id, id))
      .returning();
    return updatedTool;
  }

  async deleteTool(id: string): Promise<void> {
    await db.delete(aiTools).where(eq(aiTools.id, id));
  }

  async getPendingTools(): Promise<AiTool[]> {
    return await db.select().from(aiTools)
      .where(eq(aiTools.status, "pending"))
      .orderBy(desc(aiTools.createdAt));
  }

  async approveTool(id: string): Promise<void> {
    await db
      .update(aiTools)
      .set({ status: "approved", updatedAt: new Date() })
      .where(eq(aiTools.id, id));
  }

  async rejectTool(id: string): Promise<void> {
    await db
      .update(aiTools)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(eq(aiTools.id, id));
  }

  async createContactRequest(request: InsertContactRequest): Promise<ContactRequest> {
    const [contactRequest] = await db
      .insert(contactRequests)
      .values(request)
      .returning();
    return contactRequest;
  }

  async getContactRequestsForStartup(startupId: string): Promise<ContactRequest[]> {
    return await db
      .select({
        id: contactRequests.id,
        toolId: contactRequests.toolId,
        clientId: contactRequests.clientId,
        message: contactRequests.message,
        clientEmail: contactRequests.clientEmail,
        clientName: contactRequests.clientName,
        status: contactRequests.status,
        createdAt: contactRequests.createdAt,
        toolName: aiTools.name
      })
      .from(contactRequests)
      .innerJoin(aiTools, eq(contactRequests.toolId, aiTools.id))
      .where(eq(aiTools.startupId, startupId))
      .orderBy(desc(contactRequests.createdAt));
  }

  async recordSearch(search: InsertSearchQuery): Promise<SearchQuery> {
    const [searchQuery] = await db
      .insert(searchQueries)
      .values(search)
      .returning();
    return searchQuery;
  }

  async getSearchAnalytics(startupId?: string): Promise<any> {
    // Basic analytics implementation
    const totalSearches = await db
      .select({ count: count() })
      .from(searchQueries);

    return {
      totalSearches: totalSearches[0].count,
      // Add more analytics as needed
    };
  }

  async recordToolView(toolId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [existing] = await db
      .select()
      .from(toolAnalytics)
      .where(
        and(
          eq(toolAnalytics.toolId, toolId),
          eq(toolAnalytics.date, today)
        )
      );

    if (existing) {
      await db
        .update(toolAnalytics)
        .set({ impressions: existing.impressions + 1 })
        .where(eq(toolAnalytics.id, existing.id));
    } else {
      await db
        .insert(toolAnalytics)
        .values({
          toolId,
          date: today,
          impressions: 1,
          clicks: 0,
          contactRequests: 0
        });
    }
  }

  async recordToolClick(toolId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [existing] = await db
      .select()
      .from(toolAnalytics)
      .where(
        and(
          eq(toolAnalytics.toolId, toolId),
          eq(toolAnalytics.date, today)
        )
      );

    if (existing) {
      await db
        .update(toolAnalytics)
        .set({ clicks: existing.clicks + 1 })
        .where(eq(toolAnalytics.id, existing.id));
    } else {
      await db
        .insert(toolAnalytics)
        .values({
          toolId,
          date: today,
          impressions: 0,
          clicks: 1,
          contactRequests: 0
        });
    }
  }

  async getToolAnalytics(toolId: string): Promise<ToolAnalytics[]> {
    return await db
      .select()
      .from(toolAnalytics)
      .where(eq(toolAnalytics.toolId, toolId))
      .orderBy(desc(toolAnalytics.date));
  }
}

export const storage = new DatabaseStorage();
