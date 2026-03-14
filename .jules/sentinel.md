## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.

## 2024-05-23 - [Critical] Fail-Open in Multi-Tenant Rules
**Vulnerability:** The `isTenantMember` function in `firestore.rules` evaluated to `true` when a document was missing a `tenantId` (i.e. `tenantId == null`). This created a fail-open scenario where cross-tenant data leakage was possible for improperly scoped documents.
**Learning:** Default-allow conditions like `|| tenantId == null` severely undermine multi-tenant isolation, allowing any authenticated user broad access.
**Prevention:** Always use fail-closed logic (`tenantId != null &&`) in tenant-check authorization rules to ensure access is only granted when boundaries are strictly defined.
