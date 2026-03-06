## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.
## 2024-03-06 - [Critical] Fail Open Security Flaw in Admin API Routes
**Vulnerability:** Several admin API routes (`invite.post.ts`, `message.post.ts`, `user-action.post.ts`, `user-status.post.ts`, `users.get.ts`) suppressed authentication errors by wrapping `await verifyAdminAccess(event)` in a try-catch block without throwing or returning an error on catch. This allowed any request to bypass authorization and execute admin actions.
**Learning:** Suppressing authentication/authorization errors ('Fail Open') is a critical security anti-pattern. Admin access checks must always be strictly enforced and halt execution if unauthorized.
**Prevention:** Never wrap `verifyAdminAccess(event)` or similar security checks in try-catch blocks that do not re-throw or abort the request. The check must correctly fail execution to deny access.
