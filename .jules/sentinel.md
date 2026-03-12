## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.
## 2026-02-13 - [Critical] Fail-Open Vulnerability in Admin API Routes
**Vulnerability:** Multiple `server/api/admin/` endpoints were wrapping `await verifyAdminAccess(event)` in a `try/catch` block, sometimes silently swallowing the error with a comment `// Local dev fallback`. This created a critical fail-open scenario where unauthorized users could access admin endpoints.
**Learning:** Wrapping critical authentication checks in `try/catch` blocks that suppress errors completely nullifies the security check. Authentication must act as a hard gate.
**Prevention:** Never wrap `verifyAdminAccess(event)` in a `try/catch` block. It must be strictly awaited at the start of the `defineEventHandler` so that the native `createError` from `h3` properly returns a 401/403 status to the client.
