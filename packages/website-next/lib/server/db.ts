/* File Overview
  Path: server/db.ts
  Purpose: Bootstraps a Neon Postgres connection and exports a Drizzle ORM client bound to the shared schema.
  Requires the environment variable DATABASE_URL.

  Reading tip for newcomers:
  - If DATABASE_URL is missing, we throw to signal misconfiguration early
  - The exported `db` is used by the storage.db.ts implementation
*/

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });