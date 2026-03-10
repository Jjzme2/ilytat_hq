## 2024-05-22 - [Missing Authentication in Document API]
**Vulnerability:** The `server/api/docs` endpoints (GET, POST, DELETE) lacked authentication checks, allowing unrestricted access to sensitive document storage (R2 bucket).
**Learning:** Nuxt server routes do not inherit authentication automatically. `server/utils/adminAuth.ts` exists but was not utilized in these endpoints.
**Prevention:** Always invoke `verifyAdminToken(event)` at the beginning of `defineEventHandler` for any API route that handles sensitive data or operations.
## 2026-02-13 - [Critical] Unprotected S3 Proxy Endpoint
**Vulnerability:** The `server/api/docs.get.ts` endpoint proxied requests to Cloudflare R2 without any authentication or authorization checks.
**Learning:** Server-side API routes that act as proxies to external storage must always validate authentication before forwarding requests. Relying on obfuscated URLs is not security.
**Prevention:** Always add `verifyAdminToken` or equivalent middleware at the start of any server-side API handler that accesses sensitive data.
## 2026-03-10 - [Critical] Fail-Open Authorization in Admin APIs
**Vulnerability:** Multiple `server/api/admin/*.ts` routes wrapped `await verifyAdminAccess(event)` in a `try/catch` block explicitly to provide a "Local dev fallback". This results in a fail-open condition where authentication and authorization errors are completely swallowed, leaving endpoints unprotected in production.
**Learning:** Admin API routes (`server/api/admin/*`) must strictly `await verifyAdminAccess(event)` at the handler's start without wrapping it in a `try-catch` block. Suppressing authentication errors (Fail Open) is a strictly forbidden security anti-pattern in this codebase.
**Prevention:** Never wrap `verifyAdminToken` or `verifyAdminAccess` inside a `try/catch` block unless the error is caught to be specifically re-thrown or handled securely (e.g. throwing a new `createError({ statusCode: 403 })`).
