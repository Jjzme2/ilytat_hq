## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.

## 2026-03-07 - [Fail Open Auth Bypass in Admin Endpoints]
**Vulnerability:** Admin API endpoints in `server/api/admin/*.ts` had a `try...catch` block wrapped around `await verifyAdminAccess(event)`, catching authentication errors silently and allowing the rest of the handler to execute (a "fail-open" pattern).
**Learning:** Wrapping critical security checks in local `try-catch` blocks that swallow the exception bypasses authorization. The fallback was intended for local dev but opened up a severe vulnerability.
**Prevention:** Admin API routes (`server/api/admin/*`) must strictly await `verifyAdminAccess(event)` at the handler's start without wrapping it in a `try-catch` block.
