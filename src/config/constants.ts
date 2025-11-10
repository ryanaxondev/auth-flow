/**
 * @fileoverview Application-wide constants and enumerations.
 *
 * This module defines static, environment-independent values
 * used throughout the application — such as app metadata,
 * user roles, and standardized messages.
 *
 * @module config/constants
 */

/**
 * ----------------------------------------
 * Application Metadata
 * ----------------------------------------
 *
 * Core information about the app, including name and version.
 * This data is typically displayed in logs, headers, or responses.
 */
export const APP = {
  NAME: "AuthFlow",
  VERSION: "1.0.0",
} as const;

/**
 * ----------------------------------------
 * User Roles
 * ----------------------------------------
 *
 * Defines the available user access levels.
 * Used for permission checks and authorization logic.
 */
export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

/**
 * Type-safe representation of user roles.
 * Useful for enforcing role-based access control in TypeScript.
 */
export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * ----------------------------------------
 * Common Messages
 * ----------------------------------------
 *
 * Reusable text messages for consistent user feedback.
 * Centralizing them here simplifies maintenance and localization.
 */
export const MESSAGES = {
  INTERNAL_ERROR: "An unexpected error occurred.",
  UNAUTHORIZED: "You are not authorized to access this resource.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  USER_EXISTS: "User with this email already exists.",
  USER_CREATED: "User registered successfully.",
  LOGIN_SUCCESS: "Login successful.",
  LOGOUT_SUCCESS: "Logout successful.",
} as const;

/**
 * ----------------------------------------
 * Refresh Token Cookie Options
 * ----------------------------------------
 *
 * Configuration for the refresh token cookie.
 * Ensures security and consistent behavior across environments.
 */
export const refreshCookieOptions = {
  httpOnly: true,           // Inaccessible via JavaScript (for security)
  sameSite: "lax",          // Better compatibility for localhost
  secure: false,            // Should be true in production (HTTPS)
  path: "/",                // Cookie available throughout the app
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;
