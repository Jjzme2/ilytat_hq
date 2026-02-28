## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.

## 2024-02-28 - [Critical] Firestore Rules isTenantMember Fail Open
**Vulnerability:** The `isTenantMember` function in `firestore.rules` had a `tenantId == null` condition, allowing any authenticated user to pass the tenant check if the requested resource had a null or missing `tenantId`.
**Learning:** Checking for `null` parameters in authorization rules can lead to "fail open" scenarios, allowing unintended access when data structure is incomplete or maliciously formed.
**Prevention:** Always use strict checks, like `tenantId != null`, to explicitly require valid data for authorization. Never allow access by default for missing or malformed inputs.
