/**
 * @file index.ts
 * @module APIServer
 * @description Express server entry point for the Quantize Website API
 * 
 * This file sets up the main Express server with:
 * - Middleware configuration (JSON parsing, request logging)
 * - API route registration
 * - Vite integration for development HMR
 * - Static file serving for production
 * - Error handling middleware
 * 
 * @requires express
 * @requires ./src/routes/routes
 * @requires ./src/utils/vite
 * @since 1.0.0
 * 
 * @example
 * // Start the server
 * yarn dev    // Development mode with HMR
 * yarn start  // Production mode
 */

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./src/routes/routes";
import { setupVite, serveStatic, log } from "./src/utils/vite";

const app = express();

/**
 * Middleware Configuration
 * Parse JSON and URL-encoded request bodies for API endpoints
 */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/**
 * Request Logger Middleware
 * Logs API requests with method, path, status code, duration, and response data
 * Only logs requests to /api/* endpoints to avoid cluttering logs with static assets
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object  
 * @param {NextFunction} next - Express next function
 */
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Attach all application routes (auth, tools, admin, analytics)
  const server = await registerRoutes(app);

  // Central error handler converts thrown errors into JSON responses
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    // In development, mount Vite as Express middleware for HMR and HTML transformation
    await setupVite(app, server);
  } else {
    // In production, serve the static build from dist/public
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '3001', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
