/**
 * src/controllers/apiAuthController.ts
 * ----------------------------------------
 * Express controller handling authentication flow using JWT + Drizzle ORM.
 *
 * Integrates:
 *  - Drizzle ORM
 *  - JWT services
 *  - Express session and cookie handling
 *
 * @module controllers/apiAuthController
 * ----------------------------------------
 */

import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "#/db/index.js";
import { users } from "#/db/schema.js";
import {
  createAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "#/services/jwt.service.js";
import { AppError } from "#/errors/errorHandler.js";

/* ----------------------------------------
 * Cookie Configuration
 * ----------------------------------------
 *
 * Defines secure cookie options for storing refresh tokens.
 */

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/* ----------------------------------------
 * Controllers
 * ----------------------------------------
 *
 * Collection of route handlers managing authentication flow.
 */

/**
 * POST /api/auth/register
 *
 * Registers a new user and issues access and refresh tokens.
 */
export async function apiRegisterUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) throw new AppError("Email and password are required.", 400);

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (existingUser) throw new AppError("User already exists.", 409);

    const hashed = await bcrypt.hash(password, 10);
    const [user] = await db
      .insert(users)
      .values({ email, password: hashed, username: name })
      .returning({ id: users.id, email: users.email, username: users.username });

    const payload = { userId: user.id, email: user.email };
    const accessToken = createAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.cookie("refresh_token", refreshToken, refreshCookieOptions);

    return res.status(201).json({
      success: true,
      data: {
        user,
        tokens: {
          access: accessToken,
          expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
        },
      },
      message: "User registered successfully.",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 *
 * Authenticates a user using email and password.
 * Supports both web (session) and API (JWT) clients.
 */
export async function apiLoginUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError("Email and password are required.", 400);

    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new AppError("Invalid credentials.", 401);

    const payload = { userId: user.id, email: user.email };
    const accessToken = createAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        tokens: {
          access: accessToken,
          expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
        },
      },
      message: "Login successful.",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/refresh
 *
 * Generates new access and refresh tokens.
 * Supports cookie-based and body-based token refresh.
 */
export async function apiRefreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token =
      req.cookies?.refresh_token || req.body?.refreshToken || req.body?.token;

    if (!token) throw new AppError("Missing refresh token.", 401);

    const payload = verifyRefreshToken(token);
    if (!payload || typeof payload !== "object")
      throw new AppError("Invalid or expired refresh token.", 403);

    const newAccessToken = createAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    res.cookie("refresh_token", newRefreshToken, refreshCookieOptions);

    return res.json({
      success: true,
      data: {
        tokens: {
          access: newAccessToken,
          refresh: newRefreshToken,
          expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
        },
      },
      message: "Token refreshed successfully.",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/profile
 *
 * Retrieves authenticated user's profile.
 * Supports session, access token, and refresh token authentication.
 */
export async function apiGetProfile(req: Request, res: Response, next: NextFunction) {
  try {
    let userId: string | undefined;

    // Session-based authentication
    if (req.session?.user) {
      userId = req.session.user.id;
    }

    // Access token authentication
    else if (req.headers.authorization?.startsWith("Bearer ")) {
      const token = req.headers.authorization.split(" ")[1];
      try {
        const payload = verifyAccessToken(token);
        if (payload?.userId) userId = payload.userId;
      } catch {
        // silently ignore invalid token
      }
    }

    // Refresh token authentication
    else if (req.cookies.refresh_token) {
      try {
        const payload = verifyRefreshToken(req.cookies.refresh_token);
        if (payload?.userId) {
          const newAccessToken = createAccessToken({
            userId: payload.userId,
            email: payload.email,
          });
          res.setHeader("x-new-access-token", newAccessToken);
          userId = payload.userId;
        }
      } catch {
        // silently ignore invalid token
      }
    }

    if (!userId) throw new AppError("Unauthorized: Missing or invalid credentials.", 401);

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, email: true, username: true },
    });

    if (!user) throw new AppError("User not found.", 404);

    return res.json({
      success: true,
      data: { user },
      message: "Profile fetched successfully.",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 *
 * Clears refresh token cookie and ends session.
 */
export function apiLogout(req: Request, res: Response) {
  res.clearCookie("refresh_token", { ...refreshCookieOptions, maxAge: 0 });
  return res.json({ success: true, message: "Logged out successfully." });
}

/* ----------------------------------------
 * Module Exports
 * ----------------------------------------
 *
 * Provides all authentication controller functions.
 */

export default {
  apiRegisterUser,
  apiLoginUser,
  apiRefreshToken,
  apiGetProfile,
  apiLogout,
};
