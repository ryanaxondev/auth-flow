/**
 * src/controllers/index.ts
 * ----------------------------------------
 * Centralized export hub for all controller modules.
 *
 * Integrates:
 *  - AuthController
 *  - ApiAuthController
 *  - UserController
 *
 * @module controllers/index
 * ----------------------------------------
 */

export * as AuthController from "./authController.js";
export * as ApiAuthController from "./apiAuthController.js";
export * as UserController from "./userController.js";
