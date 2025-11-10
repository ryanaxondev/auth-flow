/**
 * src/db/index.ts
 * ----------------------------------------
 * Database Connection & ORM Initialization
 *
 * Establishes a PostgreSQL connection pool using node-postgres
 * and initializes Drizzle ORM with the defined schema.
 *
 * @module db/index
 * ----------------------------------------
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";
import { config } from "../config/env.js";

/**
 * ----------------------------------------
 * createDb
 * ----------------------------------------
 *
 * Initializes and configures a PostgreSQL connection pool.
 * Ensures stable startup by verifying connection integrity.
 *
 * @returns {ReturnType<typeof drizzle>} Initialized Drizzle ORM instance.
 */
function createDb() {
  const pool = new Pool({
    connectionString: config.db.url,
    ssl: config.env === "production" ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
  });

  pool
    .connect()
    .then((client) => {
      console.log("[Database] Connected successfully.");
      client.release();
    })
    .catch((error) => {
      console.error("[Database] Connection failed:", error.message);
      process.exit(1);
    });

  const db = drizzle(pool, {
    schema,
    logger: config.env === "development",
  });

  return db;
}

/**
 * ----------------------------------------
 * Database Instance
 * ----------------------------------------
 *
 * Exports a single database instance for application-wide usage.
 */
export const db = createDb();

export default db;
