## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.

## 2026-02-13 - [Critical] Fail Open in Admin Auth
**Vulnerability:** Several admin API endpoints wrapped `verifyAdminAccess` in a `try-catch` block that suppressed errors (Fail Open), allowing unauthenticated users to bypass admin checks and access sensitive data (e.g., dump user DB, create admin accounts).
**Learning:** Never catch authentication errors unless you explicitly re-throw them or handle them securely (Fail Closed). "Local dev fallbacks" in production code are dangerous backdoors.
**Prevention:** Admin authorization checks must be top-level `await verifyAdminAccess(event)` calls without catch blocks, allowing the framework to handle the 403/401 errors naturally.

## 2026-02-13 - [Critical] Hardcoded Admin Backdoor
**Vulnerability:** `server/utils/adminAuth.ts` contained hardcoded email addresses and UIDs that granted admin access regardless of actual role or claims.
**Learning:** Hardcoded credentials or bypasses are persistent risks. They bypass centralized identity management (IM) and revocation processes.
**Prevention:** Rely strictly on verified claims (e.g., `role: 'admin'`, `tenantId`) or database lookups. Never hardcode user identifiers in authorization logic.
