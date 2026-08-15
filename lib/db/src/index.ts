import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

export const pool = new Pool({
  connectionString: databaseUrl,

  // Keep the pool very small for Render's PostgreSQL connection limits.
  max: 2,

  // Close idle connections instead of keeping stale connections alive.
  idleTimeoutMillis: 10000,

  // Don't wait too long when creating a connection.
  connectionTimeoutMillis: 10000,

  // Helps detect dead TCP connections.
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,

  // Render PostgreSQL uses SSL.
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (error) => {
  console.error("POSTGRES POOL ERROR:", {
    message: error.message,
    code: (error as any).code,
    detail: (error as any).detail,
  });
});

export const db = drizzle(pool, {
  schema,
});

export * from "./schema";