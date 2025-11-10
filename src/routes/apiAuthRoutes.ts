/**
 * src/routes/apiAuthRoutes.ts
 * ----------------------------------------
 * REST API routes for authentication.
 *
 * Exposes JSON-based endpoints for user registration,
 * login, logout, token refresh, and profile retrieval.
 *
 * Integrates:
 *  - controllers/apiAuthController
 *
 * @module routes/apiAuthRoutes
 * ----------------------------------------
 */

import { Router } from "express";
import {
  apiRegisterUser,
  apiLoginUser,
  apiRefreshToken,
  apiLogout,
  apiGetProfile,
} from "#/controllers/apiAuthController.js";

/* ----------------------------------------
 * Router Initialization
 * ----------------------------------------
 *
 * Defines all REST endpoints related to authentication.
 * Each route corresponds to a controller method.
 */
const router = Router();

/* ----------------------------------------
 * Authentication Routes
 * ----------------------------------------
 *
 * /register → Create a new user
 * /login → Authenticate and issue tokens
 * /refresh → Refresh access token
 * /logout → Invalidate active session
 * /profile → Retrieve authenticated user profile
 */
router.post("/register", apiRegisterUser);
router.post("/login", apiLoginUser);
router.post("/refresh", apiRefreshToken);
router.post("/logout", apiLogout);
router.get("/profile", apiGetProfile);

export default router;
