## 2026-02-12 - Missing Authentication on Cloudflare R2 Endpoints
**Vulnerability:** The `/api/docs` endpoints (GET, POST, DELETE) for managing files in Cloudflare R2 were completely unprotected. Any user (authenticated or not) could list, upload, or delete files.
**Learning:** Document management features built on top of external storage (like R2/S3) must have strict authentication checks on the server-side API routes, especially when the frontend app relies on client-side auth state.
**Prevention:** Always verify authentication tokens in server-side API handlers (`defineEventHandler`) before processing requests, using a shared utility like `verifyAuthToken`.
