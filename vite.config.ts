/* File Overview
  Path: vite.config.ts
  Purpose: Configures Vite for the client app. Sets the project root to client/, defines aliases used across the codebase, and places the production build in dist/public so the Express server can serve it.

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
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  cacheDir: ".vite-temp",
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
