## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.
## 2026-03-01 - [CRITICAL] Fix Fail-Open Admin Authentication By Removing Try/Catch Blocks
**Vulnerability:** The `verifyAdminAccess(event)` authentication checks in all admin API endpoints (`server/api/admin/*.ts`) were wrapped in `try/catch` blocks that swallowed the errors (e.g., HTTP 401 or 403). This created a "fail-open" vulnerability where if authentication failed, execution continued, granting unauthenticated access to sensitive admin functions.
**Learning:** Developers intended to provide a "Local dev fallback" by catching auth errors, but this inadvertently exposed the production system to severe risk by completely bypassing authorization.
**Prevention:** Never wrap critical authentication or authorization checks in `try/catch` blocks unless the error is explicitly re-thrown or handled securely (e.g., explicitly returning a 401/403 response). For local development fallbacks, use explicit environment checks (`process.env.NODE_ENV === 'development'`) instead of suppressing authentication failures.
