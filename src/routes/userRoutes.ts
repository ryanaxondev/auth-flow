/**
 * src/routes/userRoutes.ts
 * ----------------------------------------
 * Express routes for user management (JWT-protected).
 *
 * Provides secure endpoints for listing and deleting users.
 * All routes require a valid access token.
 *
 * Integrates:
 *  - controllers/userController
 *  - middleware/authGuard
 *
 * @module routes/userRoutes
 * ----------------------------------------
 */

import { Router } from "express";
import { UserController } from "#/controllers/userController.js";
import { authGuard } from "#/middleware/authGuard.js";

/* ----------------------------------------
 * Router Initialization
 * ----------------------------------------
 *
 * Protected routes under `/api/users`.
 * Require `Authorization: Bearer <token>` header.
 */
const router = Router();

/* ----------------------------------------
 * User Management Routes
 * ----------------------------------------
 *
 * / → Get all users
 * /:email → Delete user by email
 */
router.get("/", authGuard, UserController.getAllUsers);
router.delete("/:email", authGuard, UserController.deleteUserByEmail);

export default router;
