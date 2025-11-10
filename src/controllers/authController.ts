/**
 * src/controllers/authController.ts
 * ----------------------------------------
 * Authentication controller — handles registration, login, token refresh, logout, and profile retrieval.
 *
 * Integrates:
 *  - AuthService / UserService (business logic)
 *  - JWTService (token generation and validation)
 *  - Session-based web authentication
 *
 * @module controllers/auth
 * @version 1.0.0
 * ----------------------------------------
 */

import { Request, Response, NextFunction } from "express";
import AuthService from "#/services/auth.service.js";
import UserService from "#/services/user.service.js";
import { handleControllerError } from "#/errors/auth.error.js";
import {
  createAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} from "#/services/jwt.service.js";
import { config } from "#/config/env.js";
import type { ApiResponse } from "#/types/api-response.js";

/* -------------------------------------------------------------------------- */
/*                            Express Session Types                           */
/* -------------------------------------------------------------------------- */

declare module "express-session" {
  interface SessionData {
    user?: SessionUser;
  }
}

/* -------------------------------------------------------------------------- */
/*                                   Types                                   */
/* -------------------------------------------------------------------------- */

export type SessionUser = {
  id: string;
  email: string;
  username?: string;
};

type UserData = {
  user: {
    id: string;
    email: string;
    username?: string;
    createdAt?: Date;
  };
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: string;
};

type RefreshData = {
  accessToken: string;
  refreshToken?: string;
  expiresIn: string;
};

/* -------------------------------------------------------------------------- */
/*                                Constants                                   */
/* -------------------------------------------------------------------------- */

const REFRESH_COOKIE_NAME = "refreshToken";

/**
 * Builds cookie options dynamically depending on environment.
 */
function refreshCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? "none" : "lax") as "none" | "lax" | "strict",
    path: "/auth",
  };
}

/**
 * Determines client type based on `X-Client-Type` header.
 */
function getClientType(req: Request): "web" | "mobile" {
  const header = (req.header("X-Client-Type") || "").toLowerCase();
  return header === "web" ? "web" : "mobile";
}

/* -------------------------------------------------------------------------- */
/*                                Controllers                                 */
/* -------------------------------------------------------------------------- */

/**
 * POST /auth/register
 * Registers a new user and returns basic profile data.
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ ok: false, error: "username, email and password are required" } satisfies ApiResponse);
    }

    const user = await AuthService.register({ username, email, password });

    const userResponse: UserData = {
      user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt },
    };

    return res.status(201).json({ ok: true, data: userResponse } satisfies ApiResponse<UserData>);
  } catch (err) {
    return handleControllerError(res, err, next);
  }
}

/**
 * POST /auth/login
 * Handles both session-based (web) and token-based (mobile) login.
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        error: "email and password are required",
      } satisfies ApiResponse);
    }

    const user = await AuthService.login({ email, password });
    const payload = { userId: user.id, email: user.email };

    const accessToken = createAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const expiresIn = config.jwt.accessTokenExpiresIn;
    const clientType = getClientType(req);

    const userResponse: UserData = {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken: clientType === "mobile" ? refreshToken : undefined,
      expiresIn,
    };

    if (clientType === "web") {
      req.session.user = {
        id: user.id,
        email: user.email,
        username: user.username,
      };

      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => (err ? reject(err) : resolve()));
      });

      res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });

      return res.json({
        ok: true,
        data: { ...userResponse, refreshToken: undefined },
      } satisfies ApiResponse<UserData>);
    }

    return res.json({ ok: true, data: userResponse } satisfies ApiResponse<UserData>);
  } catch (err) {
    return handleControllerError(res, err, next);
  }
}

/**
 * POST /auth/refresh
 * Issues new access and refresh tokens.
 */
export async function refreshTokenHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const clientType = getClientType(req);
    const token =
      clientType === "web"
        ? req.cookies?.[REFRESH_COOKIE_NAME]
        : (req.body?.refreshToken as string | undefined);

    if (!token) {
      return res
        .status(401)
        .json({ ok: false, error: "Refresh token missing" } satisfies ApiResponse);
    }

    const payload = verifyRefreshToken(token);
    if (!payload) {
      return res
        .status(401)
        .json({ ok: false, error: "Invalid or expired refresh token" } satisfies ApiResponse);
    }

    const newAccessToken = createAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);
    const expiresIn = config.jwt.accessTokenExpiresIn;

    if (clientType === "web") {
      res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, refreshCookieOptions());
      return res.json({
        ok: true,
        data: { accessToken: newAccessToken, expiresIn },
      } satisfies ApiResponse<Omit<RefreshData, "refreshToken">>);
    }

    return res.json({
      ok: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn },
    } satisfies ApiResponse<RefreshData>);
  } catch (err) {
    return handleControllerError(res, err, next);
  }
}

/**
 * POST /auth/logout
 * Clears both session and refresh token cookies.
 */
export async function logout(req: Request, res: Response) {
  try {
    req.session.destroy(() => {
      // Intentionally left empty to maintain behavior
    });

    res.clearCookie("sid", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    res.clearCookie("refresh_token", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      ok: true,
      message: "Logged out successfully.",
    });
  } catch {
    return res.status(500).json({ ok: false, message: "Logout failed." });
  }
}

/**
 * GET /auth/profile
 * Retrieves authenticated user info via session or access token.
 */
export async function profile(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.session?.user) {
      type SessionUserData = { user: SessionUser };
      return res.json({
        ok: true,
        data: { user: req.session.user },
      } satisfies ApiResponse<SessionUserData>);
    }

    const authHeader = req.header("Authorization") || "";
    const match = authHeader.match(/^Bearer (.+)$/i);
    if (!match) {
      return res.status(401).json({ ok: false, error: "Not authenticated" } satisfies ApiResponse);
    }

    const token = match[1];
    const payload = verifyAccessToken(token);
    if (!payload) {
      return res.status(401).json({ ok: false, error: "Invalid or expired token" } satisfies ApiResponse);
    }

    const user = await UserService.getByEmail(payload.email);
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" } satisfies ApiResponse);
    }

    type UserData = { user: { id: string; email: string; username?: string; createdAt?: Date } };

    return res.json({
      ok: true,
      data: { user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt } },
    } satisfies ApiResponse<UserData>);
  } catch (err) {
    return handleControllerError(res, err, next);
  }
}
