## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.

## 2025-05-18 - [Critical] Hardcoded Admin Credentials Found
**Vulnerability:** Hardcoded email addresses and UIDs were found in `server/utils/adminAuth.ts` and `firestore.rules`, bypassing role-based access controls.
**Learning:** Memory/documentation claimed these were removed, but they persisted in the codebase. Always verify assumptions against actual code.
**Prevention:** Strict code reviews must ensure no hardcoded identifiers (emails, UIDs) are used for authorization. Use custom claims (roles, tenantId) exclusively.
