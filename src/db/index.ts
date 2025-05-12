import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Top-level await for client.connect() is not ideal for serverless/edge environments.
// Consider connecting on demand or using a connection pool for production.
// For simplicity in this setup, we connect here.
// However, for Next.js API routes that can be invoked multiple times, 
// managing connections carefully (e.g., pooling with `pg.Pool`) is crucial.

let dbInstance: NodePgDatabase<typeof schema>;

async function initializeDb(): Promise<NodePgDatabase<typeof schema>> {
  await client.connect();
  console.log("Database client connected.");
  return drizzle(client, { schema });
}

// This is a simplified way to get a DB instance. 
// In a real app, especially serverless, you'd manage this differently.
// For example, you might not want to call connect() on every import.
// One approach is to export the promise and await it where needed, or use a singleton pattern.
// Or use a connection pool from `pg` and pass the pool to `drizzle`.

// To keep it simple for now, we export a function that returns the initialized db instance.
// This is NOT production-ready for serverless environments due to connection management.
export async function getDb(): Promise<NodePgDatabase<typeof schema>> {
  if (!dbInstance) {
    console.log("Initializing new DB instance...");
    // In a serverless function, client.connect() might be called multiple times if not managed.
    // This simple check doesn't prevent multiple connections in concurrent requests.
    // A more robust solution would use a global singleton promise for the connection.
    dbInstance = await initializeDb();
  } else {
    // console.log("Reusing existing DB instance (or so we hope in this simplified model).");
    // Check if client is still connected, this is tricky with node-postgres Client object
    // if (!client.activeQuery && client.readyForQuery) { ... }
    // A pool handles this much better.
  }
  return dbInstance;
}

// For a more robust solution with connection pooling (recommended for production):
/*
import { Pool } from 'pg';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
export const db = drizzle(pool, { schema });
*/

// For now, let's stick to the simpler client for initial setup, 
// but be aware of its limitations for production serverless use.
// Exporting the schema is also useful.
export * as DBSchema from './schema'; 