/**
 * src/services/auth.service.ts
 * ----------------------------------------
 * Authentication service layer.
 *
 * Handles core authentication business logic:
 *  - User registration (with password hashing)
 *  - User login (with credential verification)
 *  - Basic user retrieval
 *
 * Integrates:
 *  - models/userModel
 *  - utils/crypto
 *  - utils/logger
 *  - errors/auth.error
 *
 * @module services/auth
 * ----------------------------------------
 */

import UserModel from "#/models/userModel.js";
import { hashPassword, verifyPassword } from "#/utils/crypto.js";
import { logger } from "#/utils/logger.js";
import { AuthErrors } from "#/errors/auth.error.js";
import type { User, NewUser } from "#/db/schema.js";

/* ----------------------------------------
 * Data Transfer Objects (DTOs)
 * ----------------------------------------
 *
 * Defines the payload structures for authentication operations.
 */

/** DTO for user registration input */
export type RegisterInput = Pick<NewUser, "username" | "email" | "password">;

/** DTO for user login input */
export interface LoginInput {
  email: string;
  password: string;
}

/* ----------------------------------------
 * AuthService
 * ----------------------------------------
 *
 * Provides authentication and registration logic.
 * Interacts with UserModel (DB layer) and crypto utilities.
 */
export const AuthService = {
  /**
   * Registers a new user.
   *
   * @async
   * @param data - Registration form data.
   * @throws {AuthErrors.EMAIL_TAKEN} If email already exists.
   * @returns Safe user data (without password).
   */
  async register(data: RegisterInput): Promise<Omit<User, "password">> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedUsername = data.username.trim();

    const existingUser = await UserModel.findByEmail(normalizedEmail);
    if (existingUser) throw AuthErrors.EMAIL_TAKEN();

    const hashedPassword = await hashPassword(data.password);

    const newUser = await UserModel.addUser({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    logger.info("User registered", { email: newUser.email });

    const { password, ...safeUser } = newUser;
    return safeUser;
  },

  /**
   * Authenticates user credentials.
   *
   * @async
   * @param data - Login form data.
   * @throws {AuthErrors.INVALID_CREDENTIALS} If credentials are invalid.
   * @returns Safe user data (without password).
   */
  async login(data: LoginInput): Promise<Omit<User, "password">> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const user = await UserModel.findByEmail(normalizedEmail);

    const dummyHash =
      "$2b$10$C6UzMDM.H6dfI/f/IKcCcOaJwC5pZfu5aQ9D0YHhFmp9rD9lyy7hW";
    const hashToCheck = user ? user.password : dummyHash;
    const isValid = await verifyPassword(data.password, hashToCheck);

    if (!user || !isValid) throw AuthErrors.INVALID_CREDENTIALS();

    logger.info("User logged in", { email: user.email });

    const { password, ...safeUser } = user;
    return safeUser;
  },

  /**
   * Retrieves all users excluding password hashes.
   *
   * @async
   * @returns List of safe users.
   */
  async getAll(): Promise<Omit<User, "password">[]> {
    const users = await UserModel.getAll();
    return users.map(({ password, ...u }) => u);
  },
};

export default AuthService;
