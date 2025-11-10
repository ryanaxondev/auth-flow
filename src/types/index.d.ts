/**
 * src/types/index.d.ts
 * ----------------------------------------
 * Global TypeScript declarations for the Express app.
 *
 * Extends type definitions to support:
 *  - Session-based authentication (via express-session)
 *  - JWT-based authentication (via middleware)
 * Also defines the `AppConfig` interface for environment configuration.
 *
 * Integrates:
 *  - express-session
 *  - models/userModel
 *  - config/env
 *
 * @module types/index
 * ----------------------------------------
 */

import "express-session";
import type { User } from "@/models/userModel";

/* ----------------------------------------
 * Express Session
 * ----------------------------------------
 *
 * Defines the structure of user data stored
 * in session-based authentication.
 */
declare module "express-session" {
  interface SessionData {
    /** User info stored in session (browser-based login). */
    user?: Pick<User, "id" | "email" | "username">;
  }
}

/* ----------------------------------------
 * Express Request
 * ----------------------------------------
 *
 * Adds user context for JWT-based authentication.
 */
declare global {
  namespace Express {
    interface Request {
      /** User attached by JWT authentication middleware. */
      user?: Pick<User, "id" | "email">;
    }
  }
}

/* ----------------------------------------
 * AppConfig Interface
 * ----------------------------------------
 *
 * Centralized configuration type matching `config/env.ts`.
 */
export interface AppConfig {
  env: "development" | "test" | "production";
  port: number;
  db: {
    user: string;
    password: string;
    name: string;
    host: string;
    port: number;
    url: string;
  };
  session: {
    secret: string;
  };
  jwt: {
    accessTokenExpiresIn: string;
    refreshTokenExpiresIn: string;
  };
  client: {
    url: string;
  };
}

export {};
