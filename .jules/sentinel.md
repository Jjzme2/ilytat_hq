## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.
## 2026-03-22 - [Critical] Fail-Open Authentication in Admin API
**Vulnerability:** Several admin API routes in `server/api/admin/*.ts` wrapped `verifyAdminAccess(event)` in `try-catch` blocks that suppressed errors, allowing unauthenticated or non-admin users to bypass authorization checks.
**Learning:** Suppressing errors from an authentication or authorization check introduces a critical "Fail-Open" vulnerability, where the check failing does not halt execution.
**Prevention:** Never wrap critical security functions like `verifyAdminAccess` or `verifyAdminToken` in `try-catch` blocks that swallow the error. The error must be allowed to propagate to immediately terminate the request.
