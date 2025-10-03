/* File Overview
  Path: server/routes.ts
  Purpose: Declares all REST API endpoints for the application. This includes:
  - Authentication (register, login)
  - Tools (CRUD, listing, analytics, clicks)
  - Startup-specific data (tools, contact requests, analytics)
  - Admin actions (approve/reject tools)

  Reading tip for newcomers:
  - Each route follows a simple pattern: validate/parse input, call storage methods, return JSON
  - The storage layer is swappable (memory vs database) via the exported `storage` in server/storage.ts
*/

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertAiToolSchema, insertContactRequestSchema, insertSearchQuerySchema } from "../shared/schema";
import { z } from "zod";
import fetch from 'node-fetch';

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Parse and validate the incoming body with Zod to ensure correct shape
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await storage.validateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Tool routes
  app.get("/api/tools", async (req, res) => {
    try {
      const { search, status, industries, pricingModel } = req.query;
      
      // Convert raw query params into a normalized filters object
      const filters = {
        search: search as string,
        status: status as string,
        industries: industries ? (industries as string).split(",") : undefined,
        pricingModel: pricingModel as string
      };

      const tools = await storage.getTools(filters);
      res.json(tools);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });

  app.get("/api/tools/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const tool = await storage.getTool(id);
      
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }

      // Record view
      await storage.recordToolView(id);
      
      res.json(tool);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tool" });
    }
  });

  app.post("/api/tools", async (req, res) => {
    try {
      // Validate the payload against the shared schema
      const toolData = insertAiToolSchema.parse(req.body);
      const tool = await storage.createTool(toolData);
      res.json(tool);
    } catch (error) {
      res.status(400).json({ message: "Invalid tool data" });
    }
  });

  app.patch("/api/tools/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const tool = await storage.updateTool(id, updates);
      res.json(tool);
    } catch (error) {
      res.status(400).json({ message: "Failed to update tool" });
    }
  });

  app.delete("/api/tools/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTool(id);
      res.json({ message: "Tool deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tool" });
    }
  });

  // Startup dashboard routes
  app.get("/api/startup/:startupId/tools", async (req, res) => {
    try {
      const { startupId } = req.params;
      const tools = await storage.getToolsByStartup(startupId);
      res.json(tools);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch startup tools" });
    }
  });

  app.get("/api/startup/:startupId/contact-requests", async (req, res) => {
    try {
      const { startupId } = req.params;
      const contactRequests = await storage.getContactRequestsForStartup(startupId);
      res.json(contactRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact requests" });
    }
  });

  app.get("/api/startup/:startupId/analytics", async (req, res) => {
    try {
      const { startupId } = req.params;
      const analytics = await storage.getSearchAnalytics(startupId);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Contact requests
  app.post("/api/contact-requests", async (req, res) => {
    try {
      // Strongly-typed request body validation using Zod schema
      const contactData = insertContactRequestSchema.parse(req.body);
      const contactRequest = await storage.createContactRequest(contactData);
      res.json(contactRequest);
    } catch (error) {
      res.status(400).json({ message: "Invalid contact request data" });
    }
  });

  // Search routes
  app.post("/api/search", async (req, res) => {
    try {
      const { query, userId, context, selectedModel, selectedTypes } = req.body;
      
      // Record the search
      const searchData = {
        query,
        userId: userId || null,
        resultsShown: 0
      };
      
      await storage.recordSearch(searchData);

      // Call Python AI service for AI-powered search
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'https://quantize-production.up.railway.app';
      
      try {
        const aiResponse = await fetch(`${aiServiceUrl}/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            context: context || {},
            selectedModel,
            selectedTypes: selectedTypes || []
          })
        });

        if (!aiResponse.ok) {
          throw new Error(`AI service responded with status: ${aiResponse.status}`);
        }

        const aiResult = await aiResponse.json();
        
        if (aiResult.success) {
          // Also get traditional search results as fallback
          const tools = await storage.getTools({ search: query });
          
          res.json({
            query,
            aiResponse: aiResult.aiResponse,
            suggestions: aiResult.suggestions,
            companies: aiResult.companies || [],
            citations: aiResult.citations || [],
            traditionalResults: tools,
            count: tools.length,
            aiPowered: true,
            success: true
          });
          return;
        } else {
          throw new Error(aiResult.error || 'AI service failed');
        }
      } catch (aiError) {
        console.error('AI service error:', aiError);
        
        // Fallback to traditional search if AI service fails
        const tools = await storage.getTools({ search: query });
        
        // Convert tools to companies format for consistency
        const companies = tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          features: tool.features || [],
          pricing: tool.pricing,
          website: tool.website,
          category: tool.category
        }));
        
        res.json({
          query,
          aiResponse: `Here are some AI tools related to "${query}". The AI service is currently unavailable, showing database results.`,
          suggestions: [
            `Best alternatives for ${query}`,
            `Free tools for ${query}`,
            `Enterprise solutions for ${query}`,
            `Open source ${query} tools`,
            `Getting started with ${query}`
          ],
          companies: companies,
          citations: [],
          traditionalResults: tools,
          count: tools.length,
          aiPowered: false,
          fallback: true,
          aiError: aiError.message
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Admin routes
  app.get("/api/admin/pending-tools", async (req, res) => {
    try {
      const tools = await storage.getPendingTools();
      res.json(tools);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending tools" });
    }
  });

  app.post("/api/admin/tools/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.approveTool(id);
      res.json({ message: "Tool approved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to approve tool" });
    }
  });

  app.post("/api/admin/tools/:id/reject", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.rejectTool(id);
      res.json({ message: "Tool rejected successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject tool" });
    }
  });

  // Analytics routes
  app.get("/api/tools/:id/analytics", async (req, res) => {
    try {
      const { id } = req.params;
      const analytics = await storage.getToolAnalytics(id);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tool analytics" });
    }
  });

  app.post("/api/tools/:id/click", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.recordToolClick(id);
      res.json({ message: "Click recorded" });
    } catch (error) {
      res.status(500).json({ message: "Failed to record click" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
