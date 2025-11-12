```markdown
# 🔐 Auth Flows

This document explains how authentication works in the **AuthFlow Project**,  
which supports both **Session-based (Web)** and **JWT-based (API)** authentication systems.

---

## 🧩 Overview

The system is designed as a **hybrid authentication guard** that automatically detects  
whether the request comes from a traditional web route (session-based)  
or an API route (token-based).

The middleware responsible for this behavior is [`authGuard.ts`](../src/middleware/authGuard.ts).

---

## 🧠 Session-based Authentication Flow

This flow is used for **HTML routes** — typically for browser-based login and dashboard access.

```mermaid
flowchart TD
    L[Login Page] --> G[AuthGuard (Server)]
    G --> S[Create Session + HttpOnly Cookie]
    S --> A[Authenticated User]
    A -->|valid session| P[Protected HTML Routes]
    A -->|missing session| L
    A --> X[Logout Endpoint]
    X --> O[Logged Out]
````

### 🔍 Description

| Step | Action                                                                                       |
| ---- | -------------------------------------------------------------------------------------------- |
| 1️⃣  | User submits credentials through the **login page**.                                         |
| 2️⃣  | `authController` verifies credentials via `AuthService`.                                     |
| 3️⃣  | On success, a **session** is created and stored in **PostgreSQL** using `connect-pg-simple`. |
| 4️⃣  | A **secure, HttpOnly cookie** is sent to the client.                                         |
| 5️⃣  | On subsequent requests, `authGuard` checks `req.session.user`.                               |
| 6️⃣  | If valid → access granted to protected routes.                                               |
| 7️⃣  | If invalid/missing → redirect to `/login`.                                                   |
| 8️⃣  | Logout destroys the session and clears the cookie.                                           |

---

## 🔑 JWT-based Authentication Flow

This flow is designed for **API routes**, such as mobile apps or SPAs (React, Next.js, etc.).

```mermaid
flowchart TD
    R[Register] --> L[Login]
    L --> T{Verify Credentials}
    T -->|access + refresh tokens| A[Authenticated]
    A -->|valid token| P[Protected API Route]
    A -->|expired token| F[Refresh Endpoint]
    F -->|issue new access + refresh| A
```

### 🔍 Description

| Step | Action                                                                                 |
| ---- | -------------------------------------------------------------------------------------- |
| 1️⃣  | Client sends login credentials to `/api/auth/login`.                                   |
| 2️⃣  | `apiAuthController` verifies credentials and issues **Access** and **Refresh** tokens. |
| 3️⃣  | The **Access Token** is used in the `Authorization: Bearer <token>` header.            |
| 4️⃣  | `authGuard` validates the token via `verifyAccessToken()` in `jwt.service.ts`.         |
| 5️⃣  | If valid → request proceeds.                                                           |
| 6️⃣  | If expired → client calls `/api/auth/refresh` to get a new pair of tokens.             |
| 7️⃣  | Logout simply invalidates the refresh token (or client discards tokens).               |

---

## ⚙️ Hybrid Logic (authGuard.ts)

The middleware automatically determines how to authenticate the user:

```ts
if (req.session?.user) {
  // ✅ Web session authentication
} else if (authHeader?.startsWith("Bearer ")) {
  // ✅ API JWT authentication
} else if (wantsJson) {
  // ❌ API request without valid auth → return 401 JSON
} else {
  // ❌ Web request → redirect to /login
}
```

---

## 🧾 Summary

| Feature   | Session-based                         | JWT-based                      |
| --------- | ------------------------------------- | ------------------------------ |
| Storage   | PostgreSQL session store              | Token payload (stateless)      |
| Ideal for | Web dashboards, SSR apps              | Mobile apps, SPAs, APIs        |
| Cookie    | HttpOnly cookie (`connect-pg-simple`) | Optional (usually header)      |
| Logout    | Destroys server session               | Removes client tokens          |
| Guard     | Checks `req.session.user`             | Checks `Authorization: Bearer` |

---

✅ **In short:**
Your project smartly blends both worlds — sessions for browsers, tokens for APIs —
making it flexible, secure, and production-ready.

```