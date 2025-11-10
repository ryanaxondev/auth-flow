/**
 * src/app.ts
 * ----------------------------------------
 * Main Express application initialization and middleware graph.
 *
 * Integrates:
 *  - security headers + CORS
 *  - JSON / URL-encoded parsers
 *  - PostgreSQL-backed session store
 *  - route registry and global error handler
 *
 * @module app
 * ----------------------------------------
 */

import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";

import { config } from "#/config/env.js";
import routes from "#/routes/index.js";
import { globalErrorHandler } from "#/errors/errorHandler.js";

const app = express();

/* ----------------------------------------
 * Security Setup
 * ----------------------------------------
 *
 * Enables proxy trust (required for reverse proxy stacks),
 * secure HTTP headers, and cross-site access for frontend apps.
 */
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: config.client?.url || "http://localhost:3000",
    credentials: true,
  })
);

/* ----------------------------------------
 * Core Middlewares
 * ----------------------------------------
 *
 * Standard express parsers and cookie parsing.
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ----------------------------------------
 * PostgreSQL Session Store
 * ----------------------------------------
 *
 * Creates a PostgreSQL-backed session storage using pg and connect-pg-simple.
 */
const PgStore = connectPgSimple(session);

const pgPool = new Pool({
  connectionString: config.db.url,
});

const store = new PgStore({
  pool: pgPool,
  tableName: "sessions",
  createTableIfMissing: true,
});

app.use(
  session({
    name: "sid",
    store,
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
      path: "/",
    },
  })
);

/* ----------------------------------------
 * Routes
 * ----------------------------------------
 */
app.use(routes);

/* ----------------------------------------
 * Global Error Handling
 * ----------------------------------------
 */
app.use(globalErrorHandler);

/* ----------------------------------------
 * Export
 * ----------------------------------------
 */
export default app;
