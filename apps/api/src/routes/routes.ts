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
import { storage } from "../services/storage";
import { insertUserSchema, insertAiToolSchema, insertContactRequestSchema, insertSearchQuerySchema } from "../../../../packages/shared/schemas/schema";
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

  // Research streaming endpoint (for future real-time logs)
  app.get("/api/research/stream", async (req, res) => {
    const { q: query, types } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Query parameter required" });
    }

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Send initial connection confirmation
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    // Simulate research process (replace with real AI service integration)
    const simulateResearch = async () => {
      const logs = [
        {
          delay: 500,
          data: {
            type: 'reasoning',
            title: 'Reasoning',
            content: `**Analyzing query**: "${query}"\n\nI need to search for AI tools and solutions that match this query.`
          }
        },
        {
          delay: 800,
          data: {
            type: 'tool_call',
            title: 'Calling tool: web_search',
            content: `Searching for: "${query}" AI tools`,
            toolName: 'web_search'
          }
        },
        {
          delay: 1200,
          data: {
            type: 'tool_result',
            title: 'Tool Executed',
            content: JSON.stringify({ results_found: 15, status: 'success' }),
            toolName: 'web_search',
            success: true
          }
        }
      ];

      for (const { delay, data } of logs) {
        await new Promise(resolve => setTimeout(resolve, delay));
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }

      // Send completion signal
      res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
      res.end();
    };

    simulateResearch().catch(() => res.end());

    // Handle client disconnect
    req.on('close', () => {
      res.end();
    });
  });

  // AI Service proxy routes
  app.post("/api/ai-service/compare", async (req, res) => {
    try {
      const { companies } = req.body;
      
      if (!companies || !Array.isArray(companies) || companies.length < 2) {
        return res.status(400).json({ 
          message: "At least 2 companies required for comparison",
          success: false 
        });
      }

      // Call Python AI service for comparison
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5002';
      
      try {
        const aiResponse = await fetch(`${aiServiceUrl}/compare`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ companies })
        });

        if (!aiResponse.ok) {
          throw new Error(`AI service responded with status: ${aiResponse.status}`);
        }

        const aiResult = await aiResponse.json();
        res.json(aiResult);
      } catch (aiError) {
        console.error('AI service error:', aiError);
        
        // Fallback comparison
        const companyNames = companies.map(c => c.name).join(', ');
        res.json({
          comparison: `Comparison between ${companyNames}: All companies offer unique solutions with different pricing models and features. Consider your specific budget and requirements when making a decision.`,
          success: true,
          fallback: true
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Comparison failed", success: false });
    }
  });

  // Search routes
  app.post("/api/search", async (req, res) => {
    try {
      const { query, userId, context, selectedModel, selectedTypes, webSearchEnabled } = req.body;
      
      console.log('Backend received search request:');
      console.log('- Query:', query);
      console.log('- Web Search Enabled:', webSearchEnabled, '(type:', typeof webSearchEnabled, ')');
      console.log('- Selected Types:', selectedTypes);
      
      // Record the search
      const searchData = {
        query,
        userId: userId || null,
        resultsShown: 0
      };
      
      await storage.recordSearch(searchData);

      // Call Python AI service for AI-powered search
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5002';
      console.log(`Attempting to call AI service at: ${aiServiceUrl}`);
      // AI service integration - local only
      
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
            selectedTypes: selectedTypes || [],
            selectedLocations: req.body.selectedLocations || [],
            webSearchEnabled: webSearchEnabled || false
          })
        });
        
        console.log('Sent to AI service:', {
          query,
          webSearchEnabled: webSearchEnabled || false,
          selectedTypes: selectedTypes || []
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
        console.error('AI service URL used:', aiServiceUrl);
        console.error('Error details:', aiError.message);
        
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

  // Company submission route
  app.post("/api/add-company", async (req, res) => {
    try {
      const formData = req.body;
      
      // Call Python AI service to create company folder
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5002';
      
      try {
        const aiResponse = await fetch(`${aiServiceUrl}/add-company`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        if (!aiResponse.ok) {
          throw new Error(`AI service responded with status: ${aiResponse.status}`);
        }

        const result = await aiResponse.json();
        res.json(result);
      } catch (aiError) {
        console.error('Company submission error:', aiError);
        res.status(500).json({ 
          success: false,
          message: "Failed to submit company. Please try again."
        });
      }
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Company submission failed" 
      });
    }
  });

  // Text enhancement route
  app.post("/api/enhance-text", async (req, res) => {
    try {
      const { text, type, context } = req.body;
      
      if (!text || !type) {
        return res.status(400).json({
          success: false,
          error: "Text and type are required"
        });
      }
      
      // Call Python AI service for text enhancement
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5002';
      
      try {
        const aiResponse = await fetch(`${aiServiceUrl}/enhance-text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, type, context })
        });

        if (!aiResponse.ok) {
          throw new Error(`AI service responded with status: ${aiResponse.status}`);
        }

        const result = await aiResponse.json();
        res.json(result);
      } catch (aiError) {
        console.error('Text enhancement error:', aiError);
        res.status(500).json({ 
          success: false,
          error: "Failed to enhance text. Please try again."
        });
      }
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: "Text enhancement failed" 
      });
    }
  });

  // Company auto-fill route
  app.post("/api/auto-fill-company", async (req, res) => {
    try {
      const { companyName, website, linkedinPage } = req.body;
      
      if (!companyName || !website) {
        return res.status(400).json({
          success: false,
          error: "Company name and website are required"
        });
      }
      
      // Call Python AI service for auto-fill
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5002';
      
      try {
        const aiResponse = await fetch(`${aiServiceUrl}/auto-fill-company`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ companyName, website, linkedinPage })
        });

        if (!aiResponse.ok) {
          throw new Error(`AI service responded with status: ${aiResponse.status}`);
        }

        const result = await aiResponse.json();
        res.json(result);
      } catch (aiError) {
        console.error('Company auto-fill error:', aiError);
        res.status(500).json({ 
          success: false,
          error: "Failed to auto-fill company details. Please try again."
        });
      }
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: "Company auto-fill failed" 
      });
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
