/**
 * src/errors/errorHandler.ts
 * ----------------------------------------
 * Global error handler for all controllers and middlewares.
 *
 * Catches and formats known domain errors (e.g., AppError, ValidationError),
 * logs unexpected errors with stack traces, and ensures consistent
 * API response structures across the application.
 *
 * Integrates:
 *  - utils/logger
 *  - custom domain errors (AuthError, ValidationError, etc.)
 *
 * @module errors/errorHandler
 * ----------------------------------------
 */

import type { Response, Request, NextFunction } from "express";
import { logger } from "#/utils/logger.js";

/* ----------------------------------------
 * Base Application Error
 * ----------------------------------------
 *
 * Root class for all domain-specific errors
 * (AuthError, ValidationError, etc.).
 */
export class AppError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    Error.captureStackTrace?.(this, AppError);
  }
}

/* ----------------------------------------
 * ValidationError
 * ----------------------------------------
 *
 * Used by validation layers (e.g., Zod, Joi) for invalid payloads.
 */
export class ValidationError extends AppError {
  constructor(message: string, status = 400) {
    super(message, status, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

/* ----------------------------------------
 * handleControllerError
 * ----------------------------------------
 *
 * Controller-level error handler used in try/catch blocks.
 * Delegates domain errors to response and passes unknown errors to middleware.
 *
 * Example usage:
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
  if (err instanceof AppError) {
    logger.error("[AppError]", {
      name: err.name,
      code: err.code,
      message: err.message,
      status: err.status,
      stack: err.stack,
    });

    return res.status(err.status).json({
      ok: false,
      error: err.message,
      code: err.code,
    });
  }

  logger.error("[UnexpectedError]", err);
  return next(err);
}

/* ----------------------------------------
 * globalErrorHandler
 * ----------------------------------------
 *
 * Global Express error-handling middleware.
 * Should be registered in `app.ts` after all routes.
 *
 * Handles any uncaught or propagated errors and logs
 * complete request context for debugging.
 *
 * Example:
 * ```ts
 * app.use(globalErrorHandler);
 * ```
 */
export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    logger.error("[AppErrorMiddleware]", {
      name: err.name,
      code: err.code,
      message: err.message,
      status: err.status,
      path: req.originalUrl,
      method: req.method,
      stack: err.stack,
    });

    return res.status(err.status).json({
      ok: false,
      error: err.message,
      code: err.code,
    });
  }

  logger.error("[UnhandledException]", {
    message: (err as Error)?.message || "Unknown error",
    path: req.originalUrl,
    method: req.method,
    stack: (err as Error)?.stack,
  });

  return res.status(500).json({
    ok: false,
    error: "Internal server error",
  });
}
