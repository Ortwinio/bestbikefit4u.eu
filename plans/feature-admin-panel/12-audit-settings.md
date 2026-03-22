# Step 12 — Audit Log & System Settings

## Goal

Build the audit log viewer and the system settings module: role management, permission overview, system configuration, and GDPR tooling.

---

## Pre-requisites

- Steps 01–11 complete (all modules using `writeAuditLog` are in place)
- `admin_audit_logs` table in schema (step 02)
- `listAuditLogs` query in admin backend (step 03)

---

## 1. Audit log page

`src/app/(admin)/audit/page.tsx`

The audit log is an immutable, chronological record of every admin action across the platform. It is read-only — no deletions, no edits.

### Filters (top of page)

- **Admin user**: Dropdown of all admin users ("All admins" default)
- **Action type**: Dropdown grouping common action prefixes (user.*, billing.*, release.*, geometry.*, fit_run.*, message.*, impersonation.*)
- **Target type**: Dropdown (user / organization / release / geometry_record / fit_run / message / engine_version)
- **Date range**: From / To date pickers

### Table columns

| Column | Value |
|---|---|
| Time | Relative time + absolute on hover (tooltip) |
| Admin | Admin user's name and role badge |
| Action | Formatted action string (e.g. "Changed user plan" from `user.tier_change`) |
| Target | Clickable link to affected record (user detail / release detail / etc.) |
| Details | Collapsed diff or context (expandable inline row) |
| Reason | Reason text if provided (especially for impersonation, overrides) |

### Action label mapping

Define a human-readable label for each action code:

```ts
const ACTION_LABELS: Record<string, string> = {
  "user.tier_change": "Changed user plan",
  "user.suspend": "Suspended user",
  "user.restore": "Restored user",
  "user.admin_role_set": "Changed admin role",
  "billing.trial_start": "Started trial",
  "billing.trial_end": "Ended trial",
  "geometry.approve": "Approved geometry record",
  "geometry.reject": "Rejected geometry record",
  "geometry.create": "Created geometry record",
  "engine.status_change": "Changed engine version status",
  "release.create": "Created release",
  "release.status_change": "Changed release status",
  "fit_run.reviewed": "Reviewed fit run",
  "impersonation.start": "Started impersonation session",
  "message.create": "Created dashboard message",
  "message.publish": "Published dashboard message",
  // ... etc.
};
```

### Expandable details

Clicking a row expands an inline panel showing:
- Full `payload` JSON (diff format where possible)
- Full reason text
- IP address (if stored)

### Export

"Export CSV" button (super_admin only): calls a Convex action that returns the current filtered set of audit logs as a CSV download. Exported fields: time, admin, action, target type, target id, payload, reason.

---

## 2. System settings page

`src/app/(admin)/settings/page.tsx`

Tabs:
1. Admin roles
2. Feature flags
3. GDPR tooling
4. System info

---

### Tab 1 — Admin roles

Shows a table of all users with an `adminRole` set.

Columns: Name, email, role badge, assigned by (from audit log), assigned date.

**"Add admin" button** (super_admin only):
- Search for user by email
- Select role from dropdown
- Required reason field
- On confirm: calls `setAdminRole` mutation

**Remove admin access button** (super_admin only):
- Confirmation dialog with required reason
- On confirm: sets `adminRole = undefined` via `setAdminRole`

**Role reference table** below the list — shows each role and its key permissions:

| Role | Plan changes | Fit reviews | Geometry | Releases | Impersonation |
|---|---|---|---|---|---|
| super_admin | ✓ | ✓ | ✓ | ✓ | ✓ |
| ops_admin | ✓ | — | — | Partial | — |
| support_admin | — | — | — | — | ✓ |
| fit_specialist | — | ✓ | — | — | — |
| geometry_manager | — | — | ✓ | — | — |
| billing_admin | ✓ | — | — | — | — |
| qa_manager | — | — | — | ✓ | — |
| analyst | — | — | — | — | — |

---

### Tab 2 — Feature flags

A table of system-level feature flags. For v1, implement as a simple key-value store:

Add to `convex/schema.ts`:

```ts
feature_flags: defineTable({
  key: v.string(),
  value: v.boolean(),
  description: v.optional(v.string()),
  updatedBy: v.id("users"),
  updatedAt: v.number(),
})
  .index("by_key", ["key"]),
```

Initial flags:

| Key | Default | Description |
|---|---|---|
| `strava_connect_enabled` | `true` | Global toggle for Strava OAuth |
| `new_user_registration_enabled` | `true` | Allow new signups |
| `pro_upgrade_enabled` | `true` | Show upgrade CTAs to free users |
| `manual_review_queue_enabled` | `true` | Send low-confidence fits to review queue |

Admin UI: a table with key, description, toggle switch. Toggling calls `setFeatureFlag` mutation (super_admin or ops_admin only). Each change writes an audit log entry.

Convex query for the rider dashboard:

```ts
// convex/system/queries.ts (new public module)
export const getFeatureFlags = query({
  args: {},
  handler: async (ctx) => {
    const flags = await ctx.db.query("feature_flags").collect();
    return Object.fromEntries(flags.map((f) => [f.key, f.value]));
  },
});
```

---

### Tab 3 — GDPR tooling

Three panels (super_admin only):

#### Panel A — Data export

Input: user email or user ID.
Button: "Export user data"

Calls a Convex action `exportUserData` that:
1. Collects all data for the user: profile, measurements, bikes, fit sessions, feedback items, message receipts, integration data (without tokens)
2. Returns a JSON file download
3. Writes audit log: `action = "gdpr.export"`, `targetId = userId`, `reason = admin reason`

The reason field is required before the export starts.

#### Panel B — Account anonymization

Input: user email or ID.
Button: "Anonymize account"

Calls a Convex action `anonymizeUser` that:
1. Requires a confirmation: "This is irreversible. The user's personal data will be permanently removed."
2. Required reason field
3. On confirm:
   - Clears `users.email`, `users.name`, `users.displayName`, `users.profile_image_url`, `users.googleEmail`, `users.googleName`, `users.googleProfileImageUrl`
   - Clears `profiles` measurement records (replaces with tombstone row)
   - Clears `integrations` tokens and athlete data
   - Removes `feedback_items` authored by the user
   - Keeps anonymized audit log reference (replaces user name with "[Anonymized]")
4. Writes audit log: `action = "gdpr.anonymize"`

**This action is irreversible. Show a double-confirmation dialog.**

#### Panel C — Active GDPR requests

A manual tracking table for GDPR requests received outside the system (email requests from users). Admin can log:
- Request type (export / erasure)
- Requester email
- Date received
- Date fulfilled
- Notes

For v1 this is a simple manual log, not automated. Store in a `gdpr_requests` table (add to schema if implementing).

---

### Tab 4 — System info

Read-only panel showing:

- Convex deployment name (from `process.env.NEXT_PUBLIC_CONVEX_SITE_URL`)
- Current active fit engine version
- Database table row counts (approximate)
- Admin panel version (from `package.json` version field)
- Last deploy date (manual field or from env var `NEXT_PUBLIC_DEPLOY_DATE`)

---

## Convex additions needed

### New schema table

```ts
feature_flags: defineTable({
  key: v.string(),
  value: v.boolean(),
  description: v.optional(v.string()),
  updatedBy: v.id("users"),
  updatedAt: v.number(),
}).index("by_key", ["key"]),
```

### New admin mutations

```ts
export const setFeatureFlag = mutation({
  args: { key: v.string(), value: v.boolean() },
  handler: async (ctx, { key, value }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "ops_admin"]);
    const existing = await ctx.db
      .query("feature_flags")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { value, updatedBy: adminId, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("feature_flags", { key, value, updatedBy: adminId, updatedAt: Date.now() });
    }
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "feature_flag.set",
      payload: { key, value },
    });
  },
});
```

### New admin actions

```ts
export const exportUserData = action({
  args: { userId: v.id("users"), reason: v.string() },
  handler: async (ctx, { userId, reason }) => {
    const adminId = await getAuthUserId(ctx);
    // requireAnyRole check
    // Collect all user data, return as JSON object
    // Write audit log
  },
});

export const anonymizeUser = action({
  args: { userId: v.id("users"), reason: v.string() },
  handler: async (ctx, { userId, reason }) => {
    // super_admin only
    // Execute anonymization steps via internal mutations
    // Write audit log
  },
});
```

### New public query

```ts
// convex/system/queries.ts
export const getFeatureFlags = query({ ... });  // used by rider dashboard
```

---

## Acceptance criteria

- [ ] Audit log page shows all admin actions, correctly labeled and linked
- [ ] Filters narrow the log by admin, action type, target, and date
- [ ] Expandable row shows full payload diff and reason
- [ ] CSV export works for super_admin (writes audit log for the export itself)
- [ ] Admin roles tab lists all admins, allows add/remove (super_admin only)
- [ ] Role reference table is accurate
- [ ] Feature flags table allows toggling with audit log
- [ ] Feature flags are readable from the public `getFeatureFlags` query
- [ ] GDPR export compiles all user data into a downloadable JSON file
- [ ] GDPR anonymization requires double confirmation and reason; executes all clearing steps; is irreversible
- [ ] Anonymization writes an audit log entry
- [ ] System info tab shows correct deployment details
- [ ] `npm run typecheck` passes
