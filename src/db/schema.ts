/**
 * src/db/schema.ts
 * ----------------------------------------
 * Database schema definitions using Drizzle ORM.
 *
 * Defines all database tables and their corresponding TypeScript types.
 * Provides type-safe columns, constraints, and automatic UUID generation.
 *
 * Integrates:
 *  - drizzle-orm
 *  - drizzle-orm/pg-core
 *
 * @module db/schema
 * ----------------------------------------
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import {
  InferSelectModel,
  InferInsertModel,
} from "drizzle-orm";

/* ----------------------------------------
 * Users Table
 * ----------------------------------------
 *
 * Stores core user account information.
 * Each user has a unique email and username.
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ----------------------------------------
 * Sessions Table
 * ----------------------------------------
 *
 * Tracks active user sessions for token management and invalidation.
 */
export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").defaultRandom().notNull().unique(),
  data: text("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

/* ----------------------------------------
 * Type Inference
 * ----------------------------------------
 *
 * `InferSelectModel` → type of a row fetched from DB
 * `InferInsertModel` → type of data to insert into DB
 */
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Session = InferSelectModel<typeof sessions>;
export type NewSession = InferInsertModel<typeof sessions>;
