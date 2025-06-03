/**
 * Syrian Ministry of Communication - Citizen Engagement Platform
 * Database Connection and Configuration
 * 
 * @author Abdulwahab Omira <abdul@omiratech.com>
 * @version 1.0.0
 * @license MIT
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

export const closePool = async () => {
  await pool.end();
};