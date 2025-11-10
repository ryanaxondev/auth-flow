/**
 * src/services/user.service.ts
 * ----------------------------------------
 * Service layer for user data operations.
 *
 * Provides secure user retrieval without exposing sensitive fields.
 * Delegates all database interactions to UserModel and ensures
 * sanitized, type-safe data flow across the application.
 *
 * Integrates:
 *  - models/userModel
 *  - utils/logger
 *
 * @module services/user
 * ----------------------------------------
 */

import { UserModel } from "#/models/userModel.js";
import { logger } from "#/utils/logger.js";
import type { User } from "#/db/schema.js";

/* ----------------------------------------
 * Utility functions
 * ----------------------------------------
 *
 * Provides helper utilities for sanitizing and retrieving user data safely.
 */

/**
 * Removes the `password` field from a user object in a type-safe way.
 * Ensures sensitive fields are never exposed outside the service layer.
 */
function stripPassword<T extends { password?: string }>(user: T): Omit<T, "password"> {
  const { password, ...safe } = user;
  return safe;
}

/**
 * Fetches a user via the provided query function and returns a sanitized version.
 * Used internally for DRY retrieval logic.
 */
async function findSafeUser(
  queryFn: (value: string) => Promise<User | null>,
  value: string
): Promise<Omit<User, "password"> | null> {
  const user = await queryFn(value);
  return user ? stripPassword(user) : null;
}

/* ----------------------------------------
 * UserService
 * ----------------------------------------
 *
 * High-level business logic for user operations.
 * Wraps UserModel for safer, cleaner, and type-safe access patterns.
 */
export const UserService = {
  /**
   * Retrieves a user by email and returns a sanitized result.
   * @param email - Target user email.
   * @returns User without password, or null if not found.
   */
  async getByEmail(email: string): Promise<Omit<User, "password"> | null> {
    return findSafeUser(UserModel.findByEmail, email);
  },

  /**
   * Retrieves a user by username and returns a sanitized result.
   * @param username - Target username.
   * @returns User without password, or null if not found.
   */
  async getByUsername(username: string): Promise<Omit<User, "password"> | null> {
    return findSafeUser(UserModel.findByUsername, username);
  },

  /**
   * Retrieves all users excluding their password hashes.
   * @returns Array of safe user objects.
   */
  async getAll(): Promise<Omit<User, "password">[]> {
    const users = await UserModel.getAll();
    return users.map(stripPassword);
  },

  /**
   * Deletes a user by email and logs the operation.
   * @param email - Target user email.
   * @returns True if deletion succeeded, false otherwise.
   */
  async deleteByEmail(email: string): Promise<boolean> {
    logger.info(`Deleting user: ${email}`);
    return await UserModel.deleteByEmail(email);
  },
};

export default UserService;
