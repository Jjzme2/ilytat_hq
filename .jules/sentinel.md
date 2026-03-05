## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.

## 2024-03-05 - [Critical] Fail Open Logic in Admin API Authentication
**Vulnerability:** Several admin API routes (`server/api/admin/*.ts`) had authentication checks (`verifyAdminAccess`) wrapped in `try...catch` blocks that suppressed errors (e.g., `// Local dev fallback`), allowing unauthenticated or unauthorized users to execute administrative actions (fail open). The `seed.ts` endpoint also exposed stack traces on error.
**Learning:** Suppressing authentication errors (fail open) is a critical security anti-pattern. Admin API routes must strictly await authentication checks at the start of the handler without swallowing exceptions, ensuring requests fail securely if unauthorized. Stack traces should not be returned in API error responses.
**Prevention:** Always await `verifyAdminAccess` or `verifyAdminToken` directly at the top of the `defineEventHandler` block in admin routes. Do not wrap these core checks in try-catch blocks that do not re-throw the error or throw a standard 403. Avoid sending `e.stack` in API responses.
