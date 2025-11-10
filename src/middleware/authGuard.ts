/**
 * src/middleware/authGuard.ts
 * --------------------------------------------------
 * Hybrid authentication guard supporting both:
 *  - Session-based authentication (for Web routes)
 *  - JWT-based authentication (for API routes)
 *
 * Smartly detects the request type:
 *  - Web routes → redirect to `/login`
 *  - API routes → respond with JSON 401
 *
 * @module middleware/authGuard
 * --------------------------------------------------
 */

import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "#/services/jwt.service.js";
import { logger } from "#/utils/logger.js";
import { config } from "#/config/env.js";

/**
 * Express middleware: `authGuard`
 *
 * Ensures the user is authenticated either via:
 *  - Session (`req.session.user`)
 *  - JWT Bearer token (`Authorization: Bearer <token>`)
 *
 * Automatically determines response strategy (JSON vs redirect)
 * based on request headers or route context.
 */
export async function authGuard(req: Request, res: Response, next: NextFunction) {
  try {
    /* -------------------------------------------------------------------------- */
    /* 1) Session Authentication (Browser sessions)                               */
    /* -------------------------------------------------------------------------- */
    if (req.session?.user) {
      logger.debug?.(`Session user authenticated: ${req.session.user.email}`);
      return next();
    }

    /* -------------------------------------------------------------------------- */
    /* 2) JWT Authentication (API clients)                                        */
    /* -------------------------------------------------------------------------- */
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const payload = verifyAccessToken(token, config.jwt.secret);

      if (payload?.userId && payload?.email) {
        req.user = { id: payload.userId, email: payload.email };
        logger.debug?.(`JWT user authenticated: ${payload.email}`);
        return next();
      }

      logger.warn("Invalid or expired JWT token received.");
    }

    /* -------------------------------------------------------------------------- */
    /* 3) Determine Expected Response Type                                        */
    /* -------------------------------------------------------------------------- */
    const expectsJson =
      req.xhr || // AJAX / Fetch requests
      req.headers.accept?.includes("application/json") ||
      req.originalUrl.startsWith("/api/");

    if (expectsJson) {
      logger.warn("Unauthorized API access attempt.");
      return res.status(401).json({
        ok: false,
        message: "Unauthorized — valid session or JWT required.",
      });
    }

    /* -------------------------------------------------------------------------- */
    /* 4) Web Routes → Redirect to Login                                          */
    /* -------------------------------------------------------------------------- */
    logger.info("Redirecting unauthenticated user to /login");
    return res.redirect("/login");
  } catch (err) {
    logger.error("authGuard error:", err);
    return res.status(500).json({
      ok: false,
      message: "Authentication middleware encountered an error.",
    });
  }
}
