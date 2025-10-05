/* File Overview
  Path: server/index.ts
  Purpose: Express server entry point. Sets up middleware, registers API routes, integrates with Vite for development (so you can load the React app with Hot Module Replacement),
  and serves the built static files in production. Finally, it starts the HTTP server on PORT (default 3001).

  Reading tip for newcomers:
  - Scan the route registration in registerRoutes(app) to see all available API endpoints
  - In development we let Vite serve the React app; in production we serve the prebuilt files from dist/public
*/

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./src/routes/routes";
import { setupVite, serveStatic, log } from "./src/utils/vite";

const app = express();
// Parse JSON and URL-encoded bodies so API endpoints can read req.body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Lightweight request logger for API routes: logs method, path, status, and duration
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
