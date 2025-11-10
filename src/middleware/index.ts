/**
 * src/middleware/index.ts
 * --------------------------------------------------
 * Centralized export hub for all Express middleware.
 * Keeps import paths clean and consistent across the app.
 *
 * Example usage:
 *   import { authGuard } from "#/middleware";
 * --------------------------------------------------
 */

export { authGuard } from "./authGuard.js";
