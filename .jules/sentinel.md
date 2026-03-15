## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.
## 2024-05-23 - [Critical] Fail-Open Firestore Rules via null Tenant ID
**Vulnerability:** The `isTenantMember(tenantId)` function in `firestore.rules` checked `tenantId == null` as a successful condition. This allowed any authenticated user to read or write cross-tenant data if the document lacked a `tenantId` field or explicitly set it to `null`.
**Learning:** `null` checks in authorization logic often create fail-open states. In multi-tenant systems, missing scope (tenant ID) should fail closed (deny access), not fail open.
**Prevention:** In `firestore.rules`, multi-tenant isolation must be strictly enforced. Ensure all tenant-check functions explicitly validate `tenantId != null` to prevent 'fail open' vulnerabilities.
