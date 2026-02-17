# Finance Migration: Nested → Flattened Collections
**Model:** Claude 4 Sonnet  
**Date:** 2026-02-17

## Schema Changes

### Before (Nested)
```
users/{userId}/accounts/{accountId}
users/{userId}/transactions/{txId}
users/{userId}/budgets/{budgetId}
```

### After (Flattened Root)
```
accounts/{accountId}       → ownerId, scope, tenantId?, projectId?, financialViewers[]
transactions/{txId}        → ownerId, scope, tenantId?, accountId
budgets/{budgetId}         → ownerId, scope, tenantId?, spent
```

## New Fields
| Collection | Field | Type | Purpose |
|------------|-------|------|---------|
| accounts | `scope` | `'personal' \| 'tenant' \| 'project'` | Access level |
| accounts | `ownerId` | `string` | Creator UID |
| accounts | `projectId` | `string?` | Project association |
| accounts | `financialViewers` | `string[]` | UIDs with read access |
| budgets | `spent` | `number` | Running spend total |
| transactions | `scope` | `AccountScope` | Denormalized for queries |

## Migration Steps (Manual)
1. Export docs from `users/{uid}/accounts`, `transactions`, `budgets`
2. Add `ownerId: uid`, `scope: 'personal'` to each doc
3. Write to root `/accounts`, `/transactions`, `/budgets`
4. Verify Firestore rules are deployed
5. Delete nested subcollections
