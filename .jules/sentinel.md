## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.
## 2026-02-14 - [Critical] Fail-Open Authentication in Admin API Routes
**Vulnerability:** Admin API routes (`server/api/admin/*`) wrapped `verifyAdminAccess(event)` in `try-catch` blocks with empty catch clauses (e.g., `catch { // Local dev fallback }`). This fail-open design effectively bypassed authentication checks in production, allowing unauthenticated access to highly sensitive admin functions (like listing users, creating invites, triggering migrations, sending broadcast messages).
**Learning:** Suppressing authentication errors (Fail-Open) is a strictly forbidden security anti-pattern. Fallbacks meant for local development must never be hardcoded into production authentication flows.
**Prevention:** Admin API routes must strictly `await verifyAdminAccess(event)` at the beginning of the handler. If development bypasses are absolutely necessary, they should be implemented inside the centralized `verifyAdminAccess` utility itself, strongly gated by explicit environment variables (e.g., `NODE_ENV === 'development'`), never in the individual route handlers.
