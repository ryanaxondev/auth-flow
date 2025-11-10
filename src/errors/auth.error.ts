/**
 * src/errors/auth.error.ts
 * ----------------------------------------
 * Authentication domain errors and controller-level error handler.
 *
 * Defines a structured AuthError class with metadata, reusable
 * error factories, and a standardized controller-level handler.
 *
 * Integrates:
 *  - utils/logger
 *  - express (Response, NextFunction)
 *
 * @module errors/auth
 * ----------------------------------------
 */

import type { Response, NextFunction } from "express";
import { logger } from "#/utils/logger.js";

/* ----------------------------------------
 * Domain Error Class: AuthError
 * ----------------------------------------
 *
 * Represents authentication-related domain errors.
 * Provides structured metadata and stack trace support.
 */
export class AuthError extends Error {
  readonly status: number;
  readonly code: AuthErrorCode;
  readonly isOperational = true;

  constructor(code: AuthErrorCode, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = "AuthError";
    Error.captureStackTrace?.(this, AuthError);
  }

  /**
   * Converts error instance to a JSON-safe response object.
   */
  toResponse() {
    return { ok: false, error: this.message, code: this.code };
  }
}

/* ----------------------------------------
 * Enum: AuthErrorCode
 * ----------------------------------------
 *
 * Centralized and type-safe authentication error codes.
 */
export enum AuthErrorCode {
  EMAIL_TAKEN = "EMAIL_TAKEN",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
}

/* ----------------------------------------
 * Factory Object: AuthErrors
 * ----------------------------------------
 *
 * Provides strongly-typed error factory functions for consistency.
 * Example: `throw AuthErrors.INVALID_CREDENTIALS();`
 */
export const AuthErrors = {
  EMAIL_TAKEN: () =>
    new AuthError(AuthErrorCode.EMAIL_TAKEN, "Email is already registered.", 409),

  INVALID_CREDENTIALS: () =>
    new AuthError(AuthErrorCode.INVALID_CREDENTIALS, "Invalid email or password.", 401),
};

/* ----------------------------------------
 * Function: handleControllerError
 * ----------------------------------------
 *
 * Handles controller-level authentication errors in a standardized way.
 * Logs domain errors and delegates unknown errors to global middleware.
 *
 * Usage example:
 * ```ts
 * try {
 *   ...
 * } catch (err) {
 *   return handleControllerError(res, err, next);
 * }
 * ```
 */
export function handleControllerError(
  res: Response,
  err: unknown,
  next: NextFunction
) {
  if (err instanceof AuthError) {
    logger.error("AuthError", {
      code: err.code,
      message: err.message,
      status: err.status,
    });

    return res.status(err.status).json(err.toResponse());
  }

  logger.error("UnexpectedError", err);
  return next(err);
}
