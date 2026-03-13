## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.
## 2024-03-13 - [Hardcoded Credentials in Authorization Logic]
**Vulnerability:** Multiple files (`server/utils/adminAuth.ts`, `app/composables/useUser.ts`, `ilytat_common_packages/packages/ilytat-admin-panel/composables/useUserProfile.ts`, `firestore.rules`) contained hardcoded email addresses (`admin@ilytat.com`, `zettler.jj@ilytat.com`) and a user ID (`BoHGcwh2ApNQiJJIgjZWBC9hY8I3`) to grant administrative and superuser privileges.
**Learning:** Hardcoded credentials and identifiers bypass robust role-based access control (RBAC) and pose a significant security risk if those accounts are compromised, deleted, or repurposed.
**Prevention:** Authorization logic must rely strictly on securely assigned roles and attributes (e.g., `role`, `tenantId`) managed through the administrative interface, never on hardcoded identifiers.
## 2024-03-13 - [Fail-Open Vulnerability in Multi-Tenant Access]
**Vulnerability:** The `isTenantMember(tenantId)` function in `firestore.rules` allowed authorization if the requested `tenantId` was `null`, effectively creating a fail-open scenario where unassociated data could be read/written by anyone, bypassing multi-tenant isolation.
**Learning:** Any authorization logic that allows access upon the absence of an identifier (`identifier == null || ...`) poses a significant risk of failing open, especially when checking resource isolation across tenants.
**Prevention:** Tenant-check functions must explicitly validate the existence of the identifier (`tenantId != null && ...`) to enforce strict multi-tenant isolation.
