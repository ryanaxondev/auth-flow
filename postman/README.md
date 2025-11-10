# Postman Collections for Auth Flow API

This folder contains Postman files for testing the **Auth Flow project** (JWT + Session authentication).

## Files

- `auth-flow.postman_collection.json`
  - Main API endpoints for testing JWT and session-based authentication.
  - All URLs use the `{{base_url}}` variable for environment flexibility.

- `env.postman_environment.json`
  - Template environment file with placeholders.
  - Variables:
    - `base_url` → Base URL of your API (default: `http://localhost:3000`)
    - `access_token` → JWT access token for authenticated requests (initially empty)

## Usage

1. **Import Collection & Environment**
   - Open Postman → File → Import → Select `auth-flow.postman_collection.json`
   - Open Postman → File → Import → Select `env.postman_environment.json`  

2. **Select Environment**
   - In the top-right corner of Postman, select the imported environment (`Auth Flow Environment`)

3. **Set Base URL**
   - Ensure the `base_url` variable matches your local or deployed API URL  
   - Example: `http://localhost:3000`

4. **Authenticate & Set Access Token**
   - For JWT-protected endpoints:
     1. Run the **Login (API)** request
     2. Copy the returned JWT access token
     3. Paste it into the `access_token` variable in the environment  

5. **Run Other Requests**
   - All requests that require authentication automatically use `{{access_token}}` in the `Authorization` header

