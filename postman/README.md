# 📬 Postman Collections for Auth Flow API

This folder contains all necessary Postman and cURL guides to test the **AuthFlow Project**, which implements both **Session-based** and **JWT-based** authentication.

---

## 🧩 Files

* `auth-flow.postman_collection.json`

  * Main API endpoints for testing login, registration, profile, and logout.
  * Covers both **session-based** (web) and **JWT-based** (API) routes.

* `env.postman_environment.json`

  * Template Postman environment with common variables.
  * Variables:

    * `base_url` → Base URL of your API (default: `http://localhost:3000`)
    * `access_token` → JWT token for authenticated API requests.

---

## 🚀 How to Use in Postman

### 1️⃣ Import the Collection & Environment

1. Open **Postman** → *File → Import* → Select `auth-flow.postman_collection.json`.
2. Repeat for `env.postman_environment.json`.

### 2️⃣ Select the Environment

At the top-right of Postman, choose the imported environment — e.g. `AuthFlow Environment`.

### 3️⃣ Update Base URL

Ensure the `base_url` variable matches your running API server, e.g.:

```
http://localhost:3000
```

### 4️⃣ Authenticate and Set Token

1. Run **Login (API)** request.
2. Copy the returned `access_token`.
3. Paste it into the environment variable `access_token`.

### 5️⃣ Run Authenticated Requests

All protected requests will automatically inject the token into the `Authorization` header:

```
Authorization: Bearer {{access_token}}
```

---

# 🧪 Curl Test Guide for Auth Project

Below are practical examples for testing the entire authentication lifecycle manually via `curl`.

---

### 1️⃣ Register a New User

```bash
curl -v -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@example.com","password":"strongpassword2","username":"John Doe2"}'
```

✅ **Expected:** `201 Created` — returns user info + tokens.

---

### 2️⃣ Login and Store Cookies (Session Auth)

```bash
curl -v -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"user2@example.com","password":"strongpassword2"}'
```

✅ **Expected:** `200 OK` with user JSON and tokens.

* `-c cookies.txt` → saves session cookies.
* Check cookies: should contain `sid` and `refresh_token`.

---

### 3️⃣ Access Protected Profile (Session)

```bash
curl -v -X GET http://localhost:3000/auth/profile \
  -b cookies.txt
```

✅ **Expected:** `200 OK` with user data.

---

### 4️⃣ Access Protected Profile (JWT)

```bash
ACCESS_TOKEN="<your_access_token_here>"
curl -v -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

✅ **Expected:** `200 OK` with user data.
❌ **If token invalid:** `401 Unauthorized`.

---

### 5️⃣ Refresh Token Flow

```bash
curl -v -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt
```

✅ **Expected:** returns new access token.
❌ **After logout:** should return `403 Forbidden`.

---

### 6️⃣ Logout

```bash
curl -v -X POST http://localhost:3000/auth/logout \
  -b cookies.txt
```

✅ **Expected:**

* Cookies (`sid`, `refresh_token`) cleared.
* JSON: `{ "ok": true, "message": "Logged out successfully." }`

---

### 7️⃣ Access After Logout

```bash
curl -v -X GET http://localhost:3000/auth/profile \
  -b cookies.txt
```

✅ **Expected:** redirect to `/login` or `401 Unauthorized`.

---

### 8️⃣ Invalid Login Attempt

```bash
curl -v -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@example.com","password":"wrongpassword"}'
```

❌ **Expected:** `401 Unauthorized`.

---

### 9️⃣ Duplicate Registration

```bash
curl -v -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@example.com","password":"123456","username":"John Doe2"}'
```

❌ **Expected:** `400 Bad Request` (duplicate email).

---

### 🔄 Advanced Example — Token Refresh and Retry

```bash
# 1. Login and store refresh token
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -c cookies.txt \
  -d '{"email":"user2@example.com","password":"strongpassword2"}'

# 2. Simulate expired token and refresh
curl -X POST http://localhost:3000/api/auth/refresh -b cookies.txt

# 3. Retry protected route with new access token
ACCESS_TOKEN="<new_access_token_here>"
curl -X GET http://localhost:3000/api/auth/profile -H "Authorization: Bearer $ACCESS_TOKEN"
```

✅ **Expected:** seamless re-authentication flow.

---

### ⚠️ Common Errors & Tips

| Error Message               | Cause                                           | Fix                                          |
| --------------------------- | ----------------------------------------------- | -------------------------------------------- |
| `401 Unauthorized`          | Invalid or missing token                        | Ensure Authorization header or cookie is set |
| `403 Forbidden`             | Invalid refresh token (expired or after logout) | Re-login to get new tokens                   |
| `400 Bad Request`           | Invalid body payload                            | Validate JSON fields and types               |
| `500 Internal Server Error` | Server config or DB issue                       | Check logs and `.env.local` setup            |

---

✅ **In summary:** Use Postman for fast, visual testing — or cURL for precise, scriptable checks. Both follow the same hybrid authentication logic.
