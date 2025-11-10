/**
 * src/models/userModel.ts
 * ----------------------------------------
 * Data access layer for the `users` table.
 *
 * Provides low-level database operations:
 *  - Create new users
 *  - Retrieve users by username or email
 *  - Fetch all users
 *  - Delete users by email
 *
 * This layer abstracts Drizzle ORM queries and ensures
 * type-safe interactions with the database.
 *
 * Integrates:
 *  - db/index
 *  - db/schema
 *  - drizzle-orm (query builder)
 *
 * @module models/userModel
 * ----------------------------------------
 */

import { db } from "#/db/index.js";
import { users, type User, type NewUser } from "#/db/schema.js";
import { eq } from "drizzle-orm";

/* ----------------------------------------
 * UserModel
 * ----------------------------------------
 *
 * Handles all database operations related to `users`.
 * Each method returns fully typed Drizzle results.
 * No business logic should be included here.
 */
export const UserModel = {
  /**
   * Find a user by username.
   * @async
   * @param {string} username - Username to search for.
   * @returns {Promise<User | null>} Found user or `null` if not found.
   */
  async findByUsername(username: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user ?? null;
  },

  /**
   * Find a user by email address.
   * @async
   * @param {string} email - Email address to search for.
   * @returns {Promise<User | null>} Found user or `null` if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user ?? null;
  },

  /**
   * Insert a new user record into the database.
   * @async
   * @param {NewUser} data - Object containing user creation data.
   * @returns {Promise<User>} Newly created user record.
   */
  async addUser(data: NewUser): Promise<User> {
    const [newUser] = await db.insert(users).values(data).returning();
    return newUser;
  },

  /**
   * Retrieve all users from the database.
   * @async
   * @returns {Promise<User[]>} Array of all users in the database.
   */
  async getAll(): Promise<User[]> {
    return db.select().from(users);
  },

  /**
   * Delete a user by their email address.
   * @async
   * @param {string} email - Email address of the user to delete.
   * @returns {Promise<boolean>} `true` if a user was deleted, otherwise `false`.
   *
   * @example
   * const success = await UserModel.deleteByEmail("john@example.com");
   * if (success) console.log("User deleted successfully");
   */
  async deleteByEmail(email: string): Promise<boolean> {
    const deletedRows = await db
      .delete(users)
      .where(eq(users.email, email))
      .returning();
    return Array.isArray(deletedRows)
      ? deletedRows.length > 0
      : Boolean(deletedRows);
  },
};

export default UserModel;
