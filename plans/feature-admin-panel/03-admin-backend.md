# Step 03 — Admin Backend: Queries, Mutations & Audit Logging

## Goal

Build the shared admin backend infrastructure: the `requireAdminRole` helper (from step 01), the audit log helper used by all write operations, and the core admin queries and mutations that all subsequent modules depend on. Also implements the `getCurrentAdminUser` query and admin user bootstrapping.

---

## Pre-requisites

- Steps 01 and 02 complete (schema, auth helper file started)
- `convex/admin/authz.ts` exists from step 01

---

## 1. Audit log helper

Create `convex/admin/audit.ts`:

```ts
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface AuditEvent {
  adminUserId: Id<"users">;
  action: string;
  targetType?: string;
  targetId?: string;
  payload?: Record<string, unknown>;
  reason?: string;
}

export async function writeAuditLog(
  ctx: MutationCtx,
  event: AuditEvent
): Promise<void> {
  await ctx.db.insert("admin_audit_logs", {
    adminUserId: event.adminUserId,
    action: event.action,
    targetType: event.targetType,
    targetId: event.targetId,
    payload: event.payload ? JSON.stringify(event.payload) : undefined,
    reason: event.reason,
    occurredAt: Date.now(),
  });
}
```

**Rule**: every admin mutation that changes data must call `writeAuditLog` before returning. This is not optional. Queries do not write audit logs.

---

## 2. Core admin queries

Create `convex/admin/queries.ts`. Each query calls `requireAdminUserId` at the start.

### 2.1 Identity

```ts
export const getCurrentAdminUser = query({...});
// Returns: { _id, email, name, adminRole } or null
// Used by middleware and layout to verify admin session.
```

### 2.2 User management queries

```ts
// Paginated user list with search and filters
export const listUsers = query({
  args: {
    search: v.optional(v.string()),
    tier: v.optional(v.string()),
    adminRole: v.optional(v.string()),
    suspended: v.optional(v.boolean()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireAdminUserId(ctx);
    // Use Convex pagination. Filter by search (name/email), tier, adminRole, suspended.
  },
});

// Full user detail (all fields except auth tokens)
export const getUserDetail = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await requireAdminUserId(ctx);
    const user = await ctx.db.get(userId);
    // Also fetch: active integration, bike count, fit session count, subscription
    return { user, bikeCount, fitRunCount, stravaConnected, ... };
  },
});
```

### 2.3 Overview KPI queries

```ts
// Returns aggregate counts for the overview dashboard
export const getOverviewStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminUserId(ctx);
    return {
      totalUsers: ...,
      freeUsers: ...,
      proUsers: ...,
      premiumUsers: ...,
      completedFits: ...,
      stravaConnected: ...,
      openFeedbackItems: ...,
      // etc.
    };
  },
});
```

### 2.4 Feedback queries

```ts
export const listFeedbackItems = query({
  args: {
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
    paginationOpts: paginationOptsValidator,
  },
  ...
});

export const getFeedbackDetail = query({
  args: { feedbackItemId: v.id("feedback_items") },
  ...
  // Returns item + comments + linked user + linked release
});
```

### 2.5 Release queries

```ts
export const listReleases = query({
  args: {
    status: v.optional(v.string()),
    type: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  ...
});

export const getReleaseDetail = query({
  args: { releaseId: v.id("releases") },
  ...
  // Returns release + linked feedback items + engine version + message count
});
```

### 2.6 Dashboard message queries

```ts
export const listDashboardMessages = query({ ... });
export const getDashboardMessageDetail = query({
  args: { messageId: v.id("dashboard_messages") },
  // Returns message + targets + receipt aggregates
  ...
});
```

### 2.7 Geometry queries

```ts
export const listGeometryBrands = query({ ... });
export const listGeometryModels = query({ args: { brandId: v.id("geometry_brands") }, ... });
export const listGeometryRecords = query({ args: { modelId: v.id("geometry_models") }, ... });
export const getGeometryRecordDetail = query({ args: { recordId: v.id("geometry_records") }, ... });
```

### 2.8 Audit log queries

```ts
export const listAuditLogs = query({
  args: {
    adminUserId: v.optional(v.id("users")),
    targetType: v.optional(v.string()),
    targetId: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  ...
});
```

---

## 3. Core admin mutations

Create `convex/admin/mutations.ts`. Every mutation calls `requireAdminUserId` (or a more specific role check) and calls `writeAuditLog`.

### 3.1 User management

```ts
// Change a user's commercial plan/tier
export const changeUserTier = mutation({
  args: {
    userId: v.id("users"),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("premium")),
    reason: v.string(),
  },
  handler: async (ctx, { userId, tier, reason }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "billing_admin", "ops_admin"]);
    const before = await ctx.db.get(userId);
    await ctx.db.patch(userId, { tier });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "user.tier_change",
      targetType: "user",
      targetId: userId,
      payload: { before: before?.tier, after: tier },
      reason,
    });
  },
});

// Set adminRole on a user (super_admin only)
export const setAdminRole = mutation({
  args: {
    userId: v.id("users"),
    adminRole: v.optional(v.string()),   // null removes admin access
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdminRole(ctx, "super_admin");
    // validate role string, patch user, write audit log
  },
});

// Suspend a user account
export const suspendUser = mutation({
  args: { userId: v.id("users"), reason: v.string() },
  handler: async (ctx, { userId, reason }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "ops_admin", "support_admin"]);
    await ctx.db.patch(userId, { suspendedAt: Date.now(), suspendedReason: reason });
    await writeAuditLog(ctx, { adminUserId: adminId, action: "user.suspend", targetType: "user", targetId: userId, reason });
  },
});

// Restore a suspended user
export const restoreUser = mutation({
  args: { userId: v.id("users"), reason: v.string() },
  ...
});
```

### 3.2 Feedback mutations

```ts
export const updateFeedbackStatus = mutation({
  args: {
    feedbackItemId: v.id("feedback_items"),
    status: v.string(),
    assignedTo: v.optional(v.id("users")),
    priority: v.optional(v.string()),
  },
  ...
});

export const addFeedbackComment = mutation({
  args: {
    feedbackItemId: v.id("feedback_items"),
    body: v.string(),
    isInternal: v.boolean(),
  },
  ...
});

export const linkFeedbackToRelease = mutation({
  args: {
    feedbackItemId: v.id("feedback_items"),
    releaseId: v.id("releases"),
  },
  ...
});
```

### 3.3 Release mutations

```ts
export const createRelease = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    description: v.optional(v.string()),
    rolloutDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "qa_manager", "ops_admin"]);
    const releaseId = await ctx.db.insert("releases", {
      ...args,
      status: "draft",
      ownerId: adminId,
      createdBy: adminId,
      createdAt: Date.now(),
    });
    await writeAuditLog(ctx, { adminUserId: adminId, action: "release.create", targetType: "release", targetId: releaseId });
    return releaseId;
  },
});

export const updateReleaseStatus = mutation({
  args: {
    releaseId: v.id("releases"),
    status: v.string(),
    reason: v.optional(v.string()),
  },
  // Only qa_manager or super_admin can move to "approved" or "live"
  ...
});
```

### 3.4 Dashboard message mutations

```ts
export const createDashboardMessage = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    type: v.string(),
    isDismissible: v.boolean(),
    requiresAcknowledgement: v.boolean(),
    targets: v.array(v.object({ targetType: v.string(), targetValue: v.optional(v.string()) })),
    ctaText: v.optional(v.string()),
    ctaUrl: v.optional(v.string()),
    priority: v.optional(v.string()),
    locale: v.optional(v.string()),
    startsAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    linkedReleaseId: v.optional(v.id("releases")),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "ops_admin", "support_admin"]);
    const { targets, ...messageFields } = args;
    const messageId = await ctx.db.insert("dashboard_messages", {
      ...messageFields,
      createdBy: adminId,
      createdAt: Date.now(),
    });
    for (const target of targets) {
      await ctx.db.insert("message_targets", { messageId, ...target });
    }
    await writeAuditLog(ctx, { adminUserId: adminId, action: "message.create", targetType: "message", targetId: messageId });
    return messageId;
  },
});

export const publishDashboardMessage = mutation({
  args: { messageId: v.id("dashboard_messages") },
  ...
  // Sets publishedAt = Date.now(), delivers to matching users
});
```

### 3.5 Geometry mutations

```ts
export const createGeometryRecord = mutation({
  args: {
    modelId: v.id("geometry_models"),
    sizeLabel: v.string(),
    // ... all geometry fields as optional numbers
    source: v.string(),
    changeReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdminRole(ctx, "geometry_manager");
    // Find existing active record for this model+size, set it to "superseded"
    // Insert new record with version incremented, status = "draft"
    // Write audit log
  },
});

export const approveGeometryRecord = mutation({
  args: { recordId: v.id("geometry_records") },
  handler: async (ctx, { recordId }) => {
    const adminId = await requireAdminRole(ctx, "geometry_manager");
    await ctx.db.patch(recordId, {
      status: "active",
      reviewedBy: adminId,
      reviewedAt: Date.now(),
    });
    await writeAuditLog(ctx, { adminUserId: adminId, action: "geometry.approve", targetType: "geometry_record", targetId: recordId });
  },
});
```

---

## 4. Admin actions

Create `convex/admin/actions.ts`.

### 4.1 Bootstrap first admin

A one-time action to promote the first user to `super_admin`. Should check that no `super_admin` exists yet to prevent re-use.

```ts
export const bootstrapFirstAdmin = action({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    // Find user by email
    // Check no super_admin exists
    // Patch adminRole = "super_admin"
    // Write audit log
  },
});
```

**Important**: remove or disable this action after the first admin is created. Or gate it on a `ADMIN_BOOTSTRAP_SECRET` environment variable check.

### 4.2 Impersonation (read-only view)

```ts
// Returns a signed token scoped to read-only impersonation
// This does NOT create a full user session; it creates a temporary admin-view context.
export const startImpersonation = action({
  args: { targetUserId: v.id("users"), reason: v.string() },
  handler: async (ctx, { targetUserId, reason }) => {
    // Must be support_admin or super_admin
    // Write audit log with reason (required)
    // Return read-only viewer token or redirect URL
  },
});
```

---

## 5. Naming conventions

| Layer | Pattern |
|---|---|
| Admin queries | `convex/admin/queries.ts` |
| Admin mutations | `convex/admin/mutations.ts` |
| Admin actions | `convex/admin/actions.ts` |
| Auth helpers | `convex/admin/authz.ts` |
| Audit helpers | `convex/admin/audit.ts` |
| Frontend calls | `api.admin.queries.*`, `api.admin.mutations.*` |

---

## Acceptance criteria

- [ ] `requireAdminUserId`, `requireAdminRole`, `requireAnyRole` work correctly
- [ ] Every mutation that changes data writes an audit log entry before returning
- [ ] `changeUserTier` is role-gated to billing/ops/super admins
- [ ] `setAdminRole` is gated to super_admin only
- [ ] `createDashboardMessage` inserts both the message and its target rows atomically
- [ ] `bootstrapFirstAdmin` can only run once (checks for existing super_admin)
- [ ] `npm run typecheck` passes
