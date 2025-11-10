/**
 * src/services/jwt.service.ts
 * ----------------------------------------
 * Centralized JWT handling service.
 *
 * Provides a strongly typed, dependency-free abstraction over `jsonwebtoken`.
 * Handles token creation, verification, and expiry parsing — safely and predictably.
 *
 * Integrates:
 *  - jsonwebtoken
 *  - utils/logger
 *
 * @module services/jwt
 * ----------------------------------------
 */

import jwt, { SignOptions } from "jsonwebtoken";
import { logger } from "#/utils/logger.js";

/* ----------------------------------------
 * Runtime validation
 * ----------------------------------------
 *
 * Ensures required environment variables are present at runtime.
 */
if (!process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in environment");
}

const JWT_SECRET = process.env.JWT_SECRET!;
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRES_IN ?? "15m";
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN ?? "7d";

/* ----------------------------------------
 * Type definitions
 * ----------------------------------------
 *
 * Defines the core payload structure for JWT tokens.
 * Extendable for additional user-related fields.
 */
export interface JwtPayloadBase {
  userId: string;
  email: string;
}

export type JwtPayload<T extends object = {}> = JwtPayloadBase & T;

/* ----------------------------------------
 * Duration utilities
 * ----------------------------------------
 *
 * Provides safe parsing of human-readable durations into seconds.
 */
const DURATION_REGEX = /^(\d+)(s|m|h|d|w|y)$/;

/**
 * Converts human-readable duration (e.g. "15m", "1h", "7d") into seconds.
 * Throws an error for invalid inputs or formats.
 */
function parseDurationToSeconds(duration: string): number {
  if (typeof duration !== "string" || duration.trim().length === 0) {
    throw new Error(`Invalid duration: ${String(duration)}`);
  }

  const trimmed = duration.trim().toLowerCase();

  // Plain number (assume seconds)
  if (/^\d+$/.test(trimmed)) return Math.floor(Number(trimmed));

  const multipliers = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
    w: 60 * 60 * 24 * 7,
    y: 60 * 60 * 24 * 365,
  } as const;

  const match = trimmed.match(DURATION_REGEX);
  if (!match) {
    throw new Error(
      `Invalid duration format: ${duration}. Expected formats: "15m", "1h", "7d", "30s".`
    );
  }

  const value = Number(match[1]);
  const unit = match[2] as keyof typeof multipliers;

  return Math.floor(value * multipliers[unit]);
}

/* ----------------------------------------
 * Token creation
 * ----------------------------------------
 *
 * Handles access and refresh token generation using consistent settings.
 */

/**
 * Creates a short-lived access token.
 * @param payload - JWT payload containing user identity data.
 * @param secret - Custom secret override (optional).
 */
export function createAccessToken<T extends object = {}>(
  payload: JwtPayload<T>,
  secret: string = JWT_SECRET
): string {
  const cleanPayload: JwtPayload<T> = { ...payload };
  delete (cleanPayload as any).exp;
  delete (cleanPayload as any).iat;

  const options: SignOptions = { expiresIn: parseDurationToSeconds(ACCESS_TOKEN_EXPIRY) };
  return jwt.sign(cleanPayload, secret, options);
}

/**
 * Creates a long-lived refresh token.
 * @param payload - JWT payload containing user identity data.
 * @param secret - Custom secret override (optional).
 */
export function signRefreshToken<T extends object = {}>(
  payload: JwtPayload<T>,
  secret: string = JWT_SECRET
): string {
  const cleanPayload: JwtPayload<T> = { ...payload };
  delete (cleanPayload as any).exp;
  delete (cleanPayload as any).iat;

  const options: SignOptions = { expiresIn: parseDurationToSeconds(REFRESH_TOKEN_EXPIRY) };
  return jwt.sign(cleanPayload, secret, options);
}

/* ----------------------------------------
 * Token verification
 * ----------------------------------------
 *
 * Safely verifies tokens and ensures payload integrity.
 */

/**
 * Verifies any JWT token and returns its payload if valid, otherwise null.
 * @internal Used by both access and refresh token verifiers.
 */
function verifyToken<T extends object = {}>(
  token: string,
  secret: string = JWT_SECRET
): JwtPayload<T> | null {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload<T>;
    if (decoded && typeof decoded.userId === "string" && typeof decoded.email === "string") {
      return decoded;
    }
    return null;
  } catch (err) {
    logger.warn?.("Invalid or expired JWT token", err);
    return null;
  }
}

/**
 * Verifies an access token and returns the decoded payload if valid.
 */
export function verifyAccessToken<T extends object = {}>(
  token: string,
  secret: string = JWT_SECRET
): JwtPayload<T> | null {
  return verifyToken(token, secret);
}

/**
 * Verifies a refresh token and returns the decoded payload if valid.
 */
export function verifyRefreshToken<T extends object = {}>(
  token: string,
  secret: string = JWT_SECRET
): JwtPayload<T> | null {
  return verifyToken(token, secret);
}

/* ----------------------------------------
 * Unified export
 * ----------------------------------------
 *
 * Provides a centralized export for JWT operations.
 */
export const JWTService = {
  createAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};

export default JWTService;
