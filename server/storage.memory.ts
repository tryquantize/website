import { IStorage } from "./storage";
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
} from "@shared/schema";
import bcrypt from "bcryptjs";

export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private tools: AiTool[] = [];
  private contactRequests: ContactRequest[] = [];
  private searchQueries: SearchQuery[] = [];
  private toolAnalytics: ToolAnalytics[] = [];

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...insertUser,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
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
    let results = this.tools;

    if (filters?.status) {
      results = results.filter(t => t.status === filters.status);
    } else {
      results = results.filter(t => t.status === "approved");
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      results = results.filter(t => 
        t.name.toLowerCase().includes(search) || 
        t.description.toLowerCase().includes(search)
      );
    }

    if (filters?.pricingModel) {
      results = results.filter(t => t.pricingModel === filters.pricingModel);
    }

    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getTool(id: string): Promise<AiTool | undefined> {
    return this.tools.find(t => t.id === id);
  }

  async getToolsByStartup(startupId: string): Promise<AiTool[]> {
    return this.tools
      .filter(t => t.startupId === startupId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTool(tool: InsertAiTool): Promise<AiTool> {
    const newTool: AiTool = {
      id: Math.random().toString(36).substr(2, 9),
      ...tool,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tools.push(newTool);
    return newTool;
  }

  async updateTool(id: string, updates: Partial<AiTool>): Promise<AiTool> {
    const index = this.tools.findIndex(t => t.id === id);
    if (index === -1) throw new Error("Tool not found");
    
    this.tools[index] = {
      ...this.tools[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.tools[index];
  }

  async deleteTool(id: string): Promise<void> {
    const index = this.tools.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tools.splice(index, 1);
    }
  }

  async getPendingTools(): Promise<AiTool[]> {
    return this.tools
      .filter(t => t.status === "pending")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async approveTool(id: string): Promise<void> {
    await this.updateTool(id, { status: "approved" });
  }

  async rejectTool(id: string): Promise<void> {
    await this.updateTool(id, { status: "rejected" });
  }

  async createContactRequest(request: InsertContactRequest): Promise<ContactRequest> {
    const contactRequest: ContactRequest = {
      id: Math.random().toString(36).substr(2, 9),
      ...request,
      createdAt: new Date()
    };
    this.contactRequests.push(contactRequest);
    return contactRequest;
  }

  async getContactRequestsForStartup(startupId: string): Promise<ContactRequest[]> {
    return this.contactRequests
      .filter(cr => {
        const tool = this.tools.find(t => t.id === cr.toolId);
        return tool?.startupId === startupId;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async recordSearch(search: InsertSearchQuery): Promise<SearchQuery> {
    const searchQuery: SearchQuery = {
      id: Math.random().toString(36).substr(2, 9),
      ...search,
      createdAt: new Date()
    };
    this.searchQueries.push(searchQuery);
    return searchQuery;
  }

  async getSearchAnalytics(startupId?: string): Promise<any> {
    return {
      totalSearches: this.searchQueries.length
    };
  }

  async recordToolView(toolId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = this.toolAnalytics.find(ta => 
      ta.toolId === toolId && ta.date.getTime() === today.getTime()
    );

    if (existing) {
      existing.impressions += 1;
    } else {
      this.toolAnalytics.push({
        id: Math.random().toString(36).substr(2, 9),
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

    const existing = this.toolAnalytics.find(ta => 
      ta.toolId === toolId && ta.date.getTime() === today.getTime()
    );

    if (existing) {
      existing.clicks += 1;
    } else {
      this.toolAnalytics.push({
        id: Math.random().toString(36).substr(2, 9),
        toolId,
        date: today,
        impressions: 0,
        clicks: 1,
        contactRequests: 0
      });
    }
  }

  async getToolAnalytics(toolId: string): Promise<ToolAnalytics[]> {
    return this.toolAnalytics
      .filter(ta => ta.toolId === toolId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}