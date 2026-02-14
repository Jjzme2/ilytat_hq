## 2026-02-11 - Critical R2 Storage Exposure
**Vulnerability:** The R2 storage endpoints (`/api/docs`) were completely unprotected, allowing any user (authenticated or not) to list, upload, and delete ANY file in the bucket.
**Learning:** General-purpose file APIs must default to secure. Authentication checks were missing entirely, likely due to a focus on functionality first. Also, `~/` aliases in server-side code did not resolve correctly during production build, requiring relative paths.
**Prevention:** Implement `verifyAdminToken` (or similar auth check) on ALL API routes by default. Use lint rules to flag unprotected API handlers.
