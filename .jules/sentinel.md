## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.
## 2026-02-18 - [Critical] Insecure Activity Logs
**Vulnerability:** The `activity_logs` collection allowed any authenticated user to read all logs and write arbitrary logs (including for other users).
**Learning:** Default "allow if auth" rules are insufficient for multi-tenant or sensitive data. Developers often copy-paste these for quick setup and forget to lock them down.
**Prevention:** Always implement strict ownership checks (`resource.data.userId == request.auth.uid`) and immutability for audit logs. Use `allow update, delete: if false;`.
