import {
  type User,
  type InsertUser,
  type AiTool,
  type InsertAiTool,
  type ContactRequest,
  type InsertContactRequest,
  type SearchQuery,
  type InsertSearchQuery,
  type ToolAnalytics,
} from "@shared/schema";
import type { IStorage } from "./storage";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

type PartialWithId<T extends { id: string }> = Partial<T> & { id: string };

export class MemoryStorage implements IStorage {
  private users: Record<string, User> = {};
  private aiTools: Record<string, AiTool> = {};
  private contactRequests: Record<string, ContactRequest> = {};
  private searchQueries: Record<string, SearchQuery> = {};
  private analytics: Record<string, ToolAnalytics[]> = {};

  async getUser(id: string): Promise<User | undefined> {
    return this.users[id];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Object.values(this.users).find((u) => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      id,
      email: insertUser.email,
      password: hashedPassword,
      name: insertUser.name ?? null,
      role: (insertUser as any).role ?? "client",
      createdAt: now,
      updatedAt: now,
    } as User;
    this.users[id] = user;
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
    let tools = Object.values(this.aiTools);

    tools = tools.filter((t) => (filters?.status ? t.status === (filters.status as any) : t.status === "approved"));

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      tools = tools.filter(
        (t) => t.name.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q),
      );
    }

    if (filters?.pricingModel) {
      tools = tools.filter((t) => (t.pricingModel as any) === filters.pricingModel);
    }

    return tools.sort(
      (a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime(),
    );
  }

  async getTool(id: string): Promise<AiTool | undefined> {
    return this.aiTools[id];
  }

  async getToolsByStartup(startupId: string): Promise<AiTool[]> {
    return Object.values(this.aiTools)
      .filter((t) => t.startupId === startupId)
      .sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());
  }

  async createTool(tool: InsertAiTool): Promise<AiTool> {
    const id = randomUUID();
    const now = new Date();
    const created: AiTool = {
      id,
      name: tool.name,
      description: tool.description ?? null,
      oneLiner: (tool as any).oneLiner ?? null,
      websiteUrl: (tool as any).websiteUrl ?? null,
      pricingModel: (tool as any).pricingModel ?? null,
      pricingDetails: (tool as any).pricingDetails ?? null,
      features: (tool as any).features ?? null,
      industries: (tool as any).industries ?? null,
      integrations: (tool as any).integrations ?? null,
      techStack: (tool as any).techStack ?? null,
      demoVideoUrl: (tool as any).demoVideoUrl ?? null,
      logoUrl: (tool as any).logoUrl ?? null,
      startupId: (tool as any).startupId,
      status: "pending" as any,
      createdAt: now,
      updatedAt: now,
    } as AiTool;
    this.aiTools[id] = created;
    return created;
  }

  async updateTool(id: string, updates: Partial<AiTool>): Promise<AiTool> {
    const existing = this.aiTools[id];
    const updated: AiTool = { ...(existing as AiTool), ...(updates as PartialWithId<AiTool>), updatedAt: new Date() } as AiTool;
    this.aiTools[id] = updated;
    return updated;
  }

  async deleteTool(id: string): Promise<void> {
    delete this.aiTools[id];
  }

  async getPendingTools(): Promise<AiTool[]> {
    return Object.values(this.aiTools).filter((t) => t.status === ("pending" as any));
  }

  async approveTool(id: string): Promise<void> {
    if (this.aiTools[id]) {
      this.aiTools[id].status = "approved" as any;
      this.aiTools[id].updatedAt = new Date() as any;
    }
  }

  async rejectTool(id: string): Promise<void> {
    if (this.aiTools[id]) {
      this.aiTools[id].status = "rejected" as any;
      this.aiTools[id].updatedAt = new Date() as any;
    }
  }

  async createContactRequest(request: InsertContactRequest): Promise<ContactRequest> {
    const id = randomUUID();
    const now = new Date();
    const created: ContactRequest = {
      id,
      toolId: (request as any).toolId,
      clientId: (request as any).clientId,
      message: (request as any).message ?? null,
      clientEmail: (request as any).clientEmail ?? null,
      clientName: (request as any).clientName ?? null,
      status: "pending",
      createdAt: now,
    } as any;
    this.contactRequests[id] = created;
    return created;
  }

  async getContactRequestsForStartup(startupId: string): Promise<ContactRequest[]> {
    const toolIds = Object.values(this.aiTools)
      .filter((t) => t.startupId === startupId)
      .map((t) => t.id);
    return Object.values(this.contactRequests).filter((cr) => toolIds.includes(cr.toolId as any));
  }

  async recordSearch(search: InsertSearchQuery): Promise<SearchQuery> {
    const id = randomUUID();
    const now = new Date();
    const created: SearchQuery = {
      id,
      userId: (search as any).userId ?? null,
      query: search.query,
      resultsShown: (search as any).resultsShown ?? 0,
      clickedTools: (search as any).clickedTools ?? null,
      createdAt: now,
    } as any;
    this.searchQueries[id] = created;
    return created;
  }

  async getSearchAnalytics(_startupId?: string): Promise<any> {
    return { totalSearches: Object.keys(this.searchQueries).length };
  }

  async recordToolView(toolId: string): Promise<void> {
    const todayKey = new Date().toDateString();
    const list = this.analytics[toolId] || [];
    let record = list.find((r) => new Date(r.date as any).toDateString() === todayKey);
    if (!record) {
      record = {
        id: randomUUID(),
        toolId,
        date: new Date() as any,
        impressions: 0,
        clicks: 0,
        contactRequests: 0,
      } as any;
      list.push(record);
      this.analytics[toolId] = list;
    }
    record.impressions = (record.impressions as any) + 1;
  }

  async recordToolClick(toolId: string): Promise<void> {
    const todayKey = new Date().toDateString();
    const list = this.analytics[toolId] || [];
    let record = list.find((r) => new Date(r.date as any).toDateString() === todayKey);
    if (!record) {
      record = {
        id: randomUUID(),
        toolId,
        date: new Date() as any,
        impressions: 0,
        clicks: 0,
        contactRequests: 0,
      } as any;
      list.push(record);
      this.analytics[toolId] = list;
    }
    record.clicks = (record.clicks as any) + 1;
  }

  async getToolAnalytics(toolId: string): Promise<ToolAnalytics[]> {
    return this.analytics[toolId] || [];
  }
}

