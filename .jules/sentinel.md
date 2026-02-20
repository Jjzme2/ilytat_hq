## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.
## 2026-02-14 - [Critical] Admin API "Fail Open" Authentication
**Vulnerability:** Several admin endpoints (e.g., `users.get.ts`, `invite.post.ts`) wrapped `verifyAdminAccess` in a `try-catch` block that suppressed errors, allowing unauthenticated users to bypass checks and execute admin actions.
**Learning:** `try-catch` blocks that swallow errors around security gates are catastrophic. Developers added "local dev fallback" logic that persisted into production, neutralizing the security control.
**Prevention:** NEVER wrap `verifyAdminAccess` or any security gate in a `try-catch` block that suppresses the error. Let the authentication error propagate (401/403) to the client.
