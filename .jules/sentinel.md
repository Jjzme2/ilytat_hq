## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.
## 2026-11-04 - [Critical] Fail-open Authorization in Admin Routes
**Vulnerability:** Several admin API routes (`server/api/admin/*.ts`) had `await verifyAdminAccess(event)` wrapped in a `try-catch` block that suppressed errors (fail-open), allowing unauthenticated or non-admin users to bypass access controls.
**Learning:** Suppressing authentication/authorization errors is a severe security anti-pattern (fail-open). Authorization checks must be strictly awaited without `catch` blocks that silently ignore errors.
**Prevention:** Never wrap critical security checks (like `verifyAdminAccess`) in a `try-catch` block unless the `catch` block explicitly handles the error securely (e.g., throwing an HTTP 403/401 error or terminating the request).
