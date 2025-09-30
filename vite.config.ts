/* File Overview
  Path: vite.config.ts
  Purpose: Configures Vite for the client app. Sets the project root to packages/client/, defines aliases used across the codebase, and places the production build in dist/public so the Express server can serve it.

  Reading tip for newcomers:
  - Aliases like @ and @shared make imports shorter and clearer
  - The server/index.ts file uses serveStatic to serve files from dist/public in production
*/

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "packages/client", "src"),
      "@shared": path.resolve(import.meta.dirname, "packages/shared"),
    },
  },
  root: path.resolve(import.meta.dirname, "packages/client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  cacheDir: ".vite-temp",
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
