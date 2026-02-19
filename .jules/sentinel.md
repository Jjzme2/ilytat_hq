## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.
## 2026-02-13 - [Critical] Local Dev Fallback Authentication Bypass
**Vulnerability:** Multiple admin endpoints wrapped `verifyAdminAccess` in a `try-catch` block that suppressed errors to support "local dev fallback", effectively allowing unauthenticated access in all environments.
**Learning:** Never use `try-catch` to swallow authentication errors. If a local fallback is needed, it must be explicit and strictly conditioned on the environment, but preferably, local environments should be properly configured to pass auth checks.
**Prevention:** Remove `try-catch` blocks around `await verifyAdminAccess(event)`. Authentication failure must always throw an error (401/403) and stop execution.
