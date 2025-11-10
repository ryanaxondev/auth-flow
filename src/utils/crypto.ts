/**
 * src/utils/crypto.ts
 * ----------------------------------------
 * Cryptography utilities for password hashing and verification.
 *
 * Provides secure bcrypt-based password management.
 * Reads configuration from environment variables and
 * handles errors gracefully through the logger utility.
 *
 * Integrates:
 *  - bcrypt
 *  - utils/logger
 *
 * @module utils/crypto
 * ----------------------------------------
 */

import bcrypt from "bcrypt";
import { logger } from "#/utils/logger.js";

/* ----------------------------------------
 * Configuration
 * ----------------------------------------
 *
 * Number of bcrypt salt rounds, configurable via
 * environment variable `BCRYPT_SALT_ROUNDS`.
 */
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

/* ----------------------------------------
 * Hash Password
 * ----------------------------------------
 *
 * Hashes a plain text password using bcrypt.
 * Returns the resulting hash or throws an error on failure.
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    if (!password) throw new Error("Password is required for hashing");
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (err) {
    logger.error("Failed to hash password:", err);
    throw new Error("Password hashing failed");
  }
}

/* ----------------------------------------
 * Verify Password
 * ----------------------------------------
 *
 * Compares a plain password with its hashed counterpart.
 * Returns `true` if the hash matches, otherwise `false`.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    if (!password || !hash) return false;
    return await bcrypt.compare(password, hash);
  } catch (err) {
    logger.error("Password verification failed:", err);
    return false;
  }
}

/* ----------------------------------------
 * Exported Utilities
 * ----------------------------------------
 *
 * Provides grouped access to crypto functions.
 */
export const cryptoUtils = { hashPassword, verifyPassword };

export default cryptoUtils;
