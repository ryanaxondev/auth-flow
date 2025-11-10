/**
 * src/services/index.ts
 * ----------------------------------------
 * Central export hub for all service modules.
 *
 * Provides a unified import point for application services,
 * improving modularity and simplifying dependency management.
 *
 * Integrates:
 *  - services/auth
 *  - services/user
 *  - services/jwt
 *
 * @module services
 * ----------------------------------------
 */

export { default as AuthService } from "./auth.service.js";
export { default as UserService } from "./user.service.js";
export { default as JWTService } from "./jwt.service.js";
