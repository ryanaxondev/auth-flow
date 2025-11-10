/**
 * src/routes/index.ts
 * ----------------------------------------
 * Central route registry.
 *
 * Combines and organizes all route modules for both
 * session-based and token-based authentication systems.
 *
 * Integrates:
 *  - routes/authRoutes
 *  - routes/apiAuthRoutes
 *  - routes/userRoutes
 *
 * @module routes/index
 * ----------------------------------------
 */

import { Router } from "express";
import authRoutes from "./authRoutes.js";
import apiAuthRoutes from "./apiAuthRoutes.js";
import userRoutes from "./userRoutes.js";

/* ----------------------------------------
 * Router Initialization
 * ----------------------------------------
 *
 * Registers all available routes and namespaces
 * under their respective base paths.
 */
const router = Router();

/* ----------------------------------------
 * Route Registration
 * ----------------------------------------
 *
 * /auth → HTML/session-based authentication
 * /api/auth → REST/JWT-based authentication
 * /api/users → Protected user management endpoints
 */
router.use("/auth", authRoutes);
router.use("/api/auth", apiAuthRoutes);
router.use("/api/users", userRoutes);

export default router;
