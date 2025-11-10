/**
 * @file src/controllers/userController.ts
 * ----------------------------------------
 * Handles user-related HTTP requests (admin or management routes).
 *
 * Integrates:
 *  - UserService (business logic)
 *  - Logger (monitoring and audit trail)
 *
 * @module controllers/user
 * ----------------------------------------
 */

import type { Request, Response, NextFunction } from "express";
import { UserService } from "#/services/user.service.js";
import { logger } from "#/utils/logger.js";

/**
 * ----------------------------------------
 * UserController
 * ----------------------------------------
 *
 * Provides request handlers for user management:
 *  - List all users
 *  - Delete a user by email
 */
export const UserController = {
  /**
   * ----------------------------------------
   * Get All Users
   * ----------------------------------------
   *
   * Returns a list of all registered users (excluding passwords).
   * Requires prior authentication (authGuard should set req.user).
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as { id: string; email: string } | undefined;

      if (!user) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const users = await UserService.getAll();

      return res.status(200).json({
        success: true,
        data: { users },
        message: "Users fetched successfully.",
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * ----------------------------------------
   * Delete User by Email
   * ----------------------------------------
   *
   * Deletes a user by their email address.
   * Requires authentication and authorization.
   */
  async deleteUserByEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as { id: string; email: string } | undefined;
      const { email } = req.params;

      if (!user) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      if (!email) {
        return res
          .status(400)
          .json({ success: false, error: "Email parameter is required." });
      }

      const success = await UserService.deleteByEmail(email);

      if (!success) {
        logger.warn(`Attempted to delete non-existent user: ${email}`);
        return res.status(404).json({ success: false, error: "User not found." });
      }

      logger.info(`User deleted successfully: ${email}`);
      return res
        .status(200)
        .json({ success: true, message: "User deleted successfully." });
    } catch (err) {
      next(err);
    }
  },
};
