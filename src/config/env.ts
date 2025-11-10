/**
 * src/config/env.ts
 * ----------------------------------------
 * Environment configuration loader and validator.
 *
 * Loads environment variables securely with dotenv (for non-production),
 * validates them using Zod, and exports a strongly-typed `config` object.
 *
 * Supported areas:
 *  - PostgreSQL connection
 *  - Session secret
 *  - JWT expiration times
 *  - Client URL (CORS)
 * ----------------------------------------
 */

import path from "path";
import dotenv from "dotenv";
import { z } from "zod";

/**
 * ----------------------------------------
 * Load Environment Variables (.env*)
 * ----------------------------------------
 *
 * Loads .env.local or .env.test depending on NODE_ENV.
 * Skips dotenv in production for security and container compatibility.
 */
if (process.env.NODE_ENV !== "production") {
  dotenv.config({
    path: path.resolve(
      process.cwd(),
      process.env.NODE_ENV === "test" ? ".env.test" : ".env.local"
    ),
  });
}

/**
 * ----------------------------------------
 * Zod Validation Schema
 * ----------------------------------------
 *
 * Defines required and default environment variables.
 * Ensures type safety and prevents runtime misconfiguration.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().default("3000"),

  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_HOST: z.string().default("localhost"),
  POSTGRES_PORT: z.string().default("5434"),

  SESSION_SECRET: z
    .string()
    .min(8, "SESSION_SECRET must be at least 8 characters long"),

  JWT_SECRET: z.string().optional(),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  CLIENT_URL: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().optional(),
});

/**
 * ----------------------------------------
 * Parse & Validate Environment Variables
 * ----------------------------------------
 *
 * Parses process.env and exits the app if validation fails.
 */
let parsed;
try {
  parsed = envSchema.parse(process.env);
} catch (err) {
  console.error("Invalid environment configuration:", err);
  process.exit(1);
}

/**
 * ----------------------------------------
 * Build Final Config Object
 * ----------------------------------------
 *
 * Constructs a typed configuration object used throughout the app.
 */
export const config = {
  env: parsed.NODE_ENV,
  port: Number(parsed.PORT),

  db: {
    user: parsed.POSTGRES_USER,
    password: parsed.POSTGRES_PASSWORD,
    name: parsed.POSTGRES_DB,
    host: parsed.POSTGRES_HOST,
    port: Number(parsed.POSTGRES_PORT),
    url:
      parsed.DATABASE_URL ||
      `postgres://${parsed.POSTGRES_USER}:${parsed.POSTGRES_PASSWORD}@${parsed.POSTGRES_HOST}:${parsed.POSTGRES_PORT}/${parsed.POSTGRES_DB}`,
  },

  session: {
    secret: parsed.SESSION_SECRET,
  },

  jwt: {
    secret: parsed.JWT_SECRET || "fallback_jwt_secret",
    accessTokenExpiresIn: parsed.JWT_ACCESS_EXPIRES_IN,
    refreshTokenExpiresIn: parsed.JWT_REFRESH_EXPIRES_IN,
  },

  client: {
    url: parsed.CLIENT_URL,
  },
} as const;

/**
 * ----------------------------------------
 * Type Definition
 * ----------------------------------------
 *
 * Provides compile-time type safety for the config object.
 */
export type AppConfig = typeof config;
