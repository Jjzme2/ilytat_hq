# Schema Migration: Tenant Removal -> Member Sharing

**Action:** Remove multi-tenant boundaries and implement item-level array containment.

**Affected Models:**
- `Project`
- `Task`
- `Goal`
- `Document`
- `Event`
- `User`

**Changes Delivered:**
1. Dropped `tenantId` property globally.
2. Verified `members` (string array of User UIDs) is available across combinable models.
3. Default `members` initialized to contain `ownerId` gracefully upon item creation.
4. Added new database access constraints across the frontend. Instead of `where('tenantId', '==', user.value.tenantId)`, queries are now structured as `where('members', 'array-contains', user.value.uid)`.
