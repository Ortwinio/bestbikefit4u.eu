# Step 08 — Licenses & Billing Management

## Goal

Build the license and subscription management module: plan catalog management, subscription list, plan assignment, trials, and seat management for B2B accounts.

---

## Pre-requisites

- Steps 01–03 complete
- `organizations` and `organization_members` tables in schema (step 02)
- `changeUserTier` mutation exists (step 03)

---

## Context

The current codebase stores user plan as `users.tier` with values `"free"`, `"pro"`, `"premium"`. The admin license module expands this by:
1. Adding a plan catalog (structured plan definitions with entitlement flags)
2. Adding trial tracking fields to users
3. Adding a billing event log for audit purposes
4. Adding seat-based billing for organizations

For v1, there is no Stripe integration in the admin panel — plan changes are manual admin operations. The billing module tracks state, not payment processing.

---

## 1. Schema additions

Add to `convex/schema.ts`:

### `plans` table

```ts
plans: defineTable({
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  tier: v.union(
    v.literal("free"),
    v.literal("premium"),
    v.literal("pro"),
    v.literal("bike_shop"),
    v.literal("enterprise")
  ),
  priceMonthly: v.optional(v.number()),  // in cents
  priceYearly: v.optional(v.number()),
  maxBikes: v.optional(v.number()),
  maxSeats: v.optional(v.number()),
  entitlements: v.string(),              // JSON object of boolean flags
  isActive: v.boolean(),
  createdAt: v.number(),
  createdBy: v.id("users"),
})
  .index("by_slug", ["slug"])
  .index("by_tier", ["tier"]),
```

### `billing_events` table

```ts
billing_events: defineTable({
  userId: v.optional(v.id("users")),
  organizationId: v.optional(v.id("organizations")),
  eventType: v.union(
    v.literal("plan_change"),
    v.literal("trial_start"),
    v.literal("trial_end"),
    v.literal("suspension"),
    v.literal("restore"),
    v.literal("seat_change"),
    v.literal("coupon_applied"),
    v.literal("refund"),
    v.literal("credit")
  ),
  fromTier: v.optional(v.string()),
  toTier: v.optional(v.string()),
  reason: v.optional(v.string()),
  adminUserId: v.id("users"),
  metadata: v.optional(v.string()),  // JSON
  occurredAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_org", ["organizationId"])
  .index("by_occurred_at", ["occurredAt"]),
```

Add to `users` table:

```ts
trialEndsAt: v.optional(v.number()),
trialPlan: v.optional(v.string()),
couponCode: v.optional(v.string()),
```

---

## 2. Plan catalog page

`src/app/(admin)/licenses/page.tsx`

Shows all defined plans as cards.

**Each plan card shows**:
- Plan name and tier badge
- Monthly / yearly price
- Max bikes, max seats
- Entitlement list (parsed from JSON):
  - `can_connect_strava`: ✓ / ✗
  - `can_create_multiple_bikes`: ✓ / ✗
  - `can_export_advanced_report`: ✓ / ✗
  - `can_receive_manual_fit_review`: ✓ / ✗
  - `can_manage_clients`: ✓ / ✗
  - `can_use_shop_team_seats`: ✓ / ✗
  - `can_access_enterprise_reporting`: ✓ / ✗
- Active / Inactive badge
- "Edit" button

**"New plan" button** (billing_admin, super_admin) → opens the plan edit form.

### Plan edit form

Full page at `/admin/licenses/plans/new` and `/admin/licenses/plans/[planId]/edit`.

Fields:
- Name, slug (auto-generated)
- Description
- Tier dropdown
- Price monthly, price yearly (numeric, in cents)
- Max bikes, max seats
- Entitlement toggles (one toggle per entitlement flag)
- Active toggle

On save: `createPlan` or `updatePlan` mutation. Write audit log.

---

## 3. Subscriptions list

`src/app/(admin)/subscriptions/page.tsx`

Table of all users with their current plan, sorted by plan tier (Enterprise → Bike Shop → Pro → Premium → Free).

**Columns**: Name, email, plan badge, trial end date, joined date, last login, actions.

**Filters**: Plan, trial active, suspended.

**Quick actions** (inline in table row):
- "Change plan" → opens a mini-dialog (same as in user detail)
- "View user" → links to `/admin/users/[userId]`

---

## 4. Billing events feed

`src/app/(admin)/subscriptions/events/page.tsx`

A chronological log of all `billing_events`, newest first. Each row shows:
- Event type badge
- User or organization name
- From tier → to tier (for plan changes)
- Reason
- Admin who made the change
- Date

Filterable by event type and date range.

---

## 5. Trial management

On the user detail page (License tab from step 05), add a trial section:

- If no active trial: "Start trial" button → dialog:
  - Plan for trial (dropdown)
  - Duration in days
  - On confirm: sets `users.trialEndsAt`, `users.trialPlan`, and temporarily upgrades `users.tier` to the trial plan
  - Writes `billing_events` row with type `trial_start`

- If active trial: show expiry date and "Extend trial" / "End trial now" buttons

A Convex cron job (add to `convex/crons.ts`) checks daily for expired trials:

```ts
crons.daily(
  "expire-trials",
  { hourUTC: 4, minuteUTC: 0 },
  internal.admin.actions.expireTrials,
);
```

`expireTrials` action:
1. Finds all users where `trialEndsAt < Date.now()` and `tier !== "free"`
2. For each: sets `tier = "free"`, clears `trialEndsAt` and `trialPlan`
3. Writes `billing_events` row with type `trial_end`

---

## 6. Organization seat management

On the organization detail page (from step 05), add a "Billing" tab:

- Current plan and seat allocation
- "Change max seats" → numeric input, requires billing_admin
- Table of `billing_events` for this organization
- "Apply coupon" → code input, for v1: manual discount tracking (store coupon code on org record)

---

## 7. Convex additions

### Queries

```ts
export const listPlans = query({ ... });
export const getPlanDetail = query({ args: { planId: v.id("plans") }, ... });
export const listSubscriptions = query({ args: { tier, trialActive, paginationOpts }, ... });
export const listBillingEvents = query({ args: { userId, organizationId, paginationOpts }, ... });
```

### Mutations

```ts
export const createPlan = mutation({ ... });     // billing_admin, super_admin
export const updatePlan = mutation({ ... });     // billing_admin, super_admin
export const startTrial = mutation({
  args: { userId, plan: v.string(), durationDays: v.number() },
  handler: async (ctx, args) => {
    const adminId = await requireAnyRole(ctx, ["billing_admin", "super_admin"]);
    const trialEndsAt = Date.now() + args.durationDays * 86400000;
    await ctx.db.patch(args.userId, {
      tier: args.plan as "pro" | "premium",
      trialEndsAt,
      trialPlan: args.plan,
    });
    await ctx.db.insert("billing_events", {
      userId: args.userId,
      eventType: "trial_start",
      toTier: args.plan,
      adminUserId: adminId,
      occurredAt: Date.now(),
    });
    await writeAuditLog(ctx, { action: "billing.trial_start", ... });
  },
});
export const endTrial = mutation({ ... });
export const extendTrial = mutation({ ... });
```

### Internal action

```ts
// convex/admin/actions.ts
export const expireTrials = internalAction({ ... });
```

---

## Acceptance criteria

- [ ] Plan catalog shows all plans with entitlement flags
- [ ] New plan and plan edit forms work
- [ ] Subscription list shows all users by plan tier
- [ ] "Change plan" from subscription list works and writes billing event + audit log
- [ ] Trial start, extend, and end work; trial expiry cron is registered
- [ ] Billing events feed shows chronological log
- [ ] Organization seat change works
- [ ] All mutations are role-gated (billing_admin or super_admin)
- [ ] All write operations write both `billing_events` and `admin_audit_logs` entries
- [ ] `npm run typecheck` passes
