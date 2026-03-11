## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.
## 2024-05-23 - [Critical] Authentication Bypass (Fail Open) in Admin API Routes
**Vulnerability:** Several admin API routes (`server/api/admin/*.ts`) wrapped the `await verifyAdminAccess(event)` call in a `try-catch` block that suppressed errors (intended as a "local dev fallback"), effectively allowing unauthorized users to bypass authentication and execute privileged admin actions.
**Learning:** Suppressing authentication errors (Fail Open) is a critical security anti-pattern. Admin API routes must strictly enforce authorization checks and throw errors if access is denied.
**Prevention:** Never wrap `verifyAdminAccess` or `verifyAdminToken` in a `try-catch` block without explicitly re-throwing the error or terminating the request. Always use strict, fail-closed authorization.
