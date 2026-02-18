## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.

## 2026-02-18 - [Unprotected Activity Logs]
**Vulnerability:** The `activity_logs` Firestore collection allowed any authenticated user to read all logs and write arbitrary logs (including spoofing other users).
**Learning:** Root-level collections in Firestore rules often default to `allow read, write: if isAuth()` during development, which is insecure for production. Audit logs must be tamper-proof and privacy-preserving.
**Prevention:** Explicitly restrict write access to the authenticated user's own data (`request.resource.data.userId == request.auth.uid`) and deny updates/deletes for audit trails. Restrict read access to owners or admins.
