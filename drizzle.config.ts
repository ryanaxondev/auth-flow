/**
 * drizzle.config.ts
 * ----------------------------------------
 * Drizzle ORM configuration file for migrations and schema generation.
 *
 * Integrates:
 *  - environment variables (dotenv)
 *  - drizzle-kit CLI
 *
 * @module drizzle.config
 * ----------------------------------------
 */

import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://postgres:12345@localhost:5434/auth_flow";

if (process.env.NODE_ENV === "production" && !DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
