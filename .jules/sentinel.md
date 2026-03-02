## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.
## 2024-03-02 - [Critical] Fail-Open Authentication in Admin API Routes
**Vulnerability:** Several admin endpoints wrapped `await verifyAdminAccess(event)` in a `try-catch` block, effectively swallowing authentication errors and granting access even if the token verification failed (fail-open logic).
**Learning:** Security checks should never fail open. Suppressing exceptions from authentication or authorization functions compromises the entire security model.
**Prevention:** Always await `verifyAdminAccess(event)` directly at the start of admin server handlers without wrapping it in an empty `try-catch` block. Let the framework's error handling bubble up 401/403 responses.
