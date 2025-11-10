/**
 * src/routes/authRoutes.ts
 * ----------------------------------------
 * Authentication routes — JSON-only handlers.
 *
 * Provides routes for registration, login, logout,
 * token refresh, and accessing the authenticated user profile.
 *
 * Integrates:
 *  - controllers/authController
 *  - middleware/authGuard
 *
 * @module routes/authRoutes
 * ----------------------------------------
 */

import { Router } from "express";
import {
  register,
  login,
  logout,
  profile,
  refreshTokenHandler,
} from "#/controllers/authController.js";
import { authGuard } from "#/middleware/authGuard.js";

/* ----------------------------------------
 * Router Initialization
 * ----------------------------------------
 *
 * Defines JSON-based authentication routes compatible
 * with `authController` methods.
 */
const router = Router();

/* ----------------------------------------
 * Authentication Endpoints
 * ----------------------------------------
 *
 * /register → Register a new user
 * /login → Authenticate a user and issue tokens
 * /refresh → Refresh access token
 * /profile → Retrieve profile (protected)
 * /logout → Terminate session
 */
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshTokenHandler);
router.get("/profile", authGuard, profile);
router.post("/logout", logout);

export default router;
