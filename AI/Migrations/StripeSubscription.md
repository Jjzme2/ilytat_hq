# Stripe Subscription Integration — Migration

**Date:** 2026-02-24  
**Model:** Claude Sonnet 4 (Antigravity)

## Schema Change

Added fields to `tenants` collection documents:

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `stripeCustomerId` | string | `''` | Stripe customer ID for billing |
| `stripeSubscriptionId` | string | `''` | Active subscription ID |
| `subscriptionStatus` | `'active' \| 'past_due' \| 'canceled' \| 'trialing' \| 'none'` | `'none'` | Current subscription state |
| `maxMembers` | number | `2` | Maximum team members allowed by plan |

## No Migration Script Needed

Existing tenant documents will default to `subscriptionStatus: 'none'` and `maxMembers: 2` via the updated `Tenant.ts` constructor defaults. No backfill required.

## Stripe Webhook Events Handled

- `checkout.session.completed` → Activates subscription
- `customer.subscription.updated` → Syncs plan changes
- `customer.subscription.deleted` → Marks as canceled
