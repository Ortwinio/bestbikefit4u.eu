# Step 02 — Convex Schema Additions

## Goal

Add all new Convex tables required by the admin panel to `convex/schema.ts`. This step must be completed before any admin backend queries or mutations are written.

---

## Pre-requisites

- `convex/schema.ts` exists and defines the existing rider-facing tables
- `adminRole` and `suspendedAt`/`suspendedReason` have been added to `users` (from step 01)

---

## Tables to add

Add each table definition to the `defineSchema({...})` call in `convex/schema.ts`.

---

### `organizations`

B2B accounts: bike shops, enterprise partners, fitter studios.

```ts
organizations: defineTable({
  name: v.string(),
  slug: v.string(),                         // URL-safe identifier
  type: v.union(
    v.literal("bike_shop"),
    v.literal("enterprise"),
    v.literal("fitter_studio"),
    v.literal("brand")
  ),
  ownerUserId: v.id("users"),
  plan: v.optional(v.string()),             // plan ID reference
  maxSeats: v.optional(v.number()),
  usedSeats: v.optional(v.number()),
  suspendedAt: v.optional(v.number()),
  suspendedReason: v.optional(v.string()),
  billingEmail: v.optional(v.string()),
  notes: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
})
  .index("by_slug", ["slug"])
  .index("by_owner", ["ownerUserId"]),
```

---

### `organization_members`

Maps users to organizations with a seat role.

```ts
organization_members: defineTable({
  organizationId: v.id("organizations"),
  userId: v.id("users"),
  role: v.union(
    v.literal("owner"),
    v.literal("staff"),
    v.literal("fitter"),
    v.literal("viewer")
  ),
  joinedAt: v.number(),
  removedAt: v.optional(v.number()),
})
  .index("by_org", ["organizationId"])
  .index("by_user", ["userId"])
  .index("by_org_user", ["organizationId", "userId"]),
```

---

### `admin_audit_logs`

Immutable record of every admin action. Never delete or update rows.

```ts
admin_audit_logs: defineTable({
  adminUserId: v.id("users"),
  action: v.string(),                       // e.g. "user.plan_change", "impersonation.start"
  targetType: v.optional(v.string()),       // e.g. "user", "organization", "release"
  targetId: v.optional(v.string()),         // ID of affected record
  payload: v.optional(v.string()),          // JSON-encoded diff or context
  reason: v.optional(v.string()),           // Required for impersonation, overrides
  ipAddress: v.optional(v.string()),
  occurredAt: v.number(),
})
  .index("by_admin", ["adminUserId"])
  .index("by_target", ["targetType", "targetId"])
  .index("by_occurred_at", ["occurredAt"]),
```

---

### `geometry_brands`

Bike brands in the geometry library.

```ts
geometry_brands: defineTable({
  name: v.string(),
  slug: v.string(),
  logoUrl: v.optional(v.string()),
  website: v.optional(v.string()),
  notes: v.optional(v.string()),
  createdAt: v.number(),
  createdBy: v.id("users"),
})
  .index("by_slug", ["slug"]),
```

---

### `geometry_models`

Bike models per brand.

```ts
geometry_models: defineTable({
  brandId: v.id("geometry_brands"),
  name: v.string(),
  category: v.union(
    v.literal("road"),
    v.literal("gravel"),
    v.literal("mtb"),
    v.literal("tt"),
    v.literal("endurance"),
    v.literal("city"),
    v.literal("other")
  ),
  yearStart: v.optional(v.number()),
  yearEnd: v.optional(v.number()),
  notes: v.optional(v.string()),
  createdAt: v.number(),
  createdBy: v.id("users"),
})
  .index("by_brand", ["brandId"]),
```

---

### `geometry_records`

Per-size geometry data with full versioning. Never overwrite; always insert a new record with `supersededBy` pointing to the previous record.

```ts
geometry_records: defineTable({
  modelId: v.id("geometry_models"),
  brandId: v.id("geometry_brands"),          // denormalized for fast filtering
  sizeLabel: v.string(),                     // e.g. "54", "M", "Large"

  // Geometry values (mm unless otherwise noted)
  stack: v.optional(v.number()),
  reach: v.optional(v.number()),
  seatTubeAngle: v.optional(v.number()),     // degrees
  headTubeAngle: v.optional(v.number()),     // degrees
  wheelbase: v.optional(v.number()),
  chainstay: v.optional(v.number()),
  bbDrop: v.optional(v.number()),
  effectiveTopTube: v.optional(v.number()),
  standover: v.optional(v.number()),
  forkRake: v.optional(v.number()),
  headTubeLength: v.optional(v.number()),

  // Data provenance
  source: v.union(
    v.literal("manufacturer"),
    v.literal("admin_import"),
    v.literal("admin_manual"),
    v.literal("user_entered")
  ),
  sourceUrl: v.optional(v.string()),
  importJobId: v.optional(v.string()),
  changeReason: v.optional(v.string()),

  // Review state
  status: v.union(
    v.literal("draft"),
    v.literal("active"),
    v.literal("superseded"),
    v.literal("rejected")
  ),
  reviewedBy: v.optional(v.id("users")),
  reviewedAt: v.optional(v.number()),

  // Version chain
  version: v.number(),
  supersededBy: v.optional(v.id("geometry_records")),

  createdAt: v.number(),
  createdBy: v.id("users"),
})
  .index("by_model", ["modelId"])
  .index("by_brand", ["brandId"])
  .index("by_status", ["status"])
  .index("by_model_size", ["modelId", "sizeLabel"]),
```

---

### `engine_versions`

Fit engine versions. The currently active version is used for all new fit runs.

```ts
engine_versions: defineTable({
  versionLabel: v.string(),                 // e.g. "v2.4.1"
  description: v.optional(v.string()),
  status: v.union(
    v.literal("draft"),
    v.literal("qa"),
    v.literal("active"),
    v.literal("deprecated")
  ),
  ruleSetJson: v.optional(v.string()),      // JSON blob of rule configuration
  activatedAt: v.optional(v.number()),
  deprecatedAt: v.optional(v.number()),
  activatedBy: v.optional(v.id("users")),
  benchmarkResultsJson: v.optional(v.string()),
  releaseId: v.optional(v.id("releases")),  // forward reference — nullable until releases table exists
  notes: v.optional(v.string()),
  createdAt: v.number(),
  createdBy: v.id("users"),
})
  .index("by_status", ["status"]),
```

---

### `feedback_items`

User-submitted bugs, feature requests, fit quality concerns, and support cases.

```ts
feedback_items: defineTable({
  userId: v.id("users"),
  type: v.union(
    v.literal("bug"),
    v.literal("feature_request"),
    v.literal("fit_quality"),
    v.literal("data_correction"),
    v.literal("billing"),
    v.literal("general")
  ),
  title: v.string(),
  description: v.string(),
  status: v.union(
    v.literal("new"),
    v.literal("triaged"),
    v.literal("needs_info"),
    v.literal("planned"),
    v.literal("in_progress"),
    v.literal("in_qa"),
    v.literal("released"),
    v.literal("closed"),
    v.literal("declined")
  ),
  priority: v.optional(v.union(
    v.literal("low"),
    v.literal("medium"),
    v.literal("high"),
    v.literal("critical")
  )),
  productArea: v.optional(v.string()),      // e.g. "fit_engine", "geometry", "billing"
  assignedTo: v.optional(v.id("users")),    // admin user
  linkedReleaseId: v.optional(v.id("releases")),
  linkedFitRunId: v.optional(v.string()),   // fit session ID
  linkedBikeId: v.optional(v.id("bikes")),
  severity: v.optional(v.string()),         // user-chosen severity
  expectedResult: v.optional(v.string()),
  actualResult: v.optional(v.string()),
  browserInfo: v.optional(v.string()),
  appVersion: v.optional(v.string()),
  attachmentUrls: v.optional(v.array(v.string())),
  upvoteCount: v.optional(v.number()),
  duplicateOf: v.optional(v.id("feedback_items")),
  resolvedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
})
  .index("by_user", ["userId"])
  .index("by_status", ["status"])
  .index("by_type", ["type"])
  .index("by_assigned", ["assignedTo"])
  .index("by_created_at", ["createdAt"]),
```

---

### `feedback_comments`

Threaded comments on feedback items (admin replies, internal notes).

```ts
feedback_comments: defineTable({
  feedbackItemId: v.id("feedback_items"),
  authorId: v.id("users"),
  body: v.string(),
  isInternal: v.boolean(),                  // internal admin note vs user-visible reply
  createdAt: v.number(),
})
  .index("by_feedback_item", ["feedbackItemId"]),
```

---

### `releases`

Product, engine, geometry, and content releases.

```ts
releases: defineTable({
  name: v.string(),
  versionLabel: v.optional(v.string()),     // e.g. "2024.03.15" or "v2.4"
  type: v.union(
    v.literal("app"),
    v.literal("fit_engine"),
    v.literal("geometry_data"),
    v.literal("content"),
    v.literal("integration"),
    v.literal("internal")
  ),
  status: v.union(
    v.literal("draft"),
    v.literal("in_qa"),
    v.literal("approved"),
    v.literal("scheduled"),
    v.literal("rolling_out"),
    v.literal("live"),
    v.literal("rolled_back"),
    v.literal("archived")
  ),
  ownerId: v.id("users"),
  description: v.optional(v.string()),
  scope: v.optional(v.string()),
  targetAudience: v.optional(v.string()),
  qaStatus: v.optional(v.union(
    v.literal("pending"),
    v.literal("in_progress"),
    v.literal("passed"),
    v.literal("failed")
  )),
  rolloutDate: v.optional(v.number()),
  liveAt: v.optional(v.number()),
  rolledBackAt: v.optional(v.number()),
  rollbackPlan: v.optional(v.string()),
  releaseNotes: v.optional(v.string()),     // markdown
  engineVersionId: v.optional(v.id("engine_versions")),
  affectedBikeCount: v.optional(v.number()),
  affectedFitRunCount: v.optional(v.number()),
  approvedBy: v.optional(v.id("users")),
  approvedAt: v.optional(v.number()),
  createdAt: v.number(),
  createdBy: v.id("users"),
})
  .index("by_status", ["status"])
  .index("by_type", ["type"])
  .index("by_created_at", ["createdAt"]),
```

---

### `release_items`

Links feedback items (bugs, features) to a release.

```ts
release_items: defineTable({
  releaseId: v.id("releases"),
  feedbackItemId: v.id("feedback_items"),
  addedBy: v.id("users"),
  addedAt: v.number(),
})
  .index("by_release", ["releaseId"])
  .index("by_feedback_item", ["feedbackItemId"]),
```

---

### `dashboard_messages`

Admin-composed messages delivered to user dashboards.

```ts
dashboard_messages: defineTable({
  title: v.string(),
  body: v.string(),
  type: v.union(
    v.literal("banner"),
    v.literal("inbox_card"),
    v.literal("modal"),
    v.literal("sticky_warning"),
    v.literal("release_announcement"),
    v.literal("upgrade_prompt"),
    v.literal("safety_alert"),
    v.literal("refit_reminder"),
    v.literal("support_reply")
  ),
  ctaText: v.optional(v.string()),
  ctaUrl: v.optional(v.string()),
  priority: v.optional(v.union(
    v.literal("low"),
    v.literal("normal"),
    v.literal("high"),
    v.literal("urgent")
  )),
  isDismissible: v.boolean(),
  requiresAcknowledgement: v.boolean(),
  locale: v.optional(v.string()),           // null = all locales
  startsAt: v.optional(v.number()),
  expiresAt: v.optional(v.number()),
  publishedAt: v.optional(v.number()),
  pausedAt: v.optional(v.number()),
  linkedReleaseId: v.optional(v.id("releases")),
  linkedFeedbackId: v.optional(v.id("feedback_items")),
  totalDelivered: v.optional(v.number()),
  totalViewed: v.optional(v.number()),
  totalClicked: v.optional(v.number()),
  totalAcknowledged: v.optional(v.number()),
  createdBy: v.id("users"),
  createdAt: v.number(),
})
  .index("by_created_at", ["createdAt"])
  .index("by_published_at", ["publishedAt"]),
```

---

### `message_targets`

Audience targeting rules for a dashboard message.

```ts
message_targets: defineTable({
  messageId: v.id("dashboard_messages"),
  targetType: v.union(
    v.literal("all"),
    v.literal("user"),
    v.literal("plan"),
    v.literal("organization"),
    v.literal("locale"),
    v.literal("bike_type"),
    v.literal("strava_connected"),
    v.literal("fit_completed"),
    v.literal("onboarding_step")
  ),
  targetValue: v.optional(v.string()),      // e.g. user ID, plan name, locale code
})
  .index("by_message", ["messageId"]),
```

---

### `message_receipts`

Per-user delivery, view, and acknowledgement tracking.

```ts
message_receipts: defineTable({
  messageId: v.id("dashboard_messages"),
  userId: v.id("users"),
  deliveredAt: v.number(),
  viewedAt: v.optional(v.number()),
  clickedAt: v.optional(v.number()),
  acknowledgedAt: v.optional(v.number()),
  dismissedAt: v.optional(v.number()),
})
  .index("by_message", ["messageId"])
  .index("by_user", ["userId"])
  .index("by_message_user", ["messageId", "userId"]),
```

---

## Acceptance criteria

- [ ] All new tables are added to `convex/schema.ts`
- [ ] `npx convex dev` (or `npx convex deploy`) runs without schema errors
- [ ] `npm run typecheck` passes
- [ ] Existing rider-facing tables are unchanged
