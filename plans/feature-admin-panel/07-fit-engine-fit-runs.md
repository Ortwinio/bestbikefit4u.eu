# Step 07 — Fit Engine Management & Fit Runs

## Goal

Build the fit engine version management module and the fit run viewer. Admins can inspect every fit run's full trace, manage engine versions, and process the manual review queue.

---

## Pre-requisites

- Steps 01–03 complete
- `engine_versions` table in schema (step 02)
- Existing `fitSessions` table in schema (already exists in the codebase)

---

## Part A — Fit Engine Management

### A1. Engine version list

`src/app/(admin)/fit-engine/page.tsx`

Table of all `engine_versions` records, newest first.

**Columns**: version label, status badge, activated date, fit runs count under this version, actions.

**Status badge colors**:
- `draft` → gray
- `qa` → yellow
- `active` → green (only one should be active at a time)
- `deprecated` → muted/strikethrough

**"New version" button** (qa_manager, super_admin) → opens a dialog:
- Version label (e.g. "v2.5.0")
- Description / changelog notes (markdown textarea)
- Creates record with `status = "draft"`

### A2. Engine version detail

`src/app/(admin)/fit-engine/[versionId]/page.tsx`

**Sections**:

#### Status & metadata
- Version label, description, status badge
- Created by, created date
- Activated by, activated date (if applicable)

#### Status workflow actions

Only show the button appropriate for the current status:

| Current status | Available action | Required role |
|---|---|---|
| `draft` | "Submit for QA" | qa_manager, super_admin |
| `qa` | "Mark QA passed" | qa_manager |
| `qa` | "Activate this version" | super_admin, qa_manager |
| `active` | "Deprecate" | super_admin |
| `deprecated` | — | — |

Activating a version must first confirm: "This will deprecate the currently active version. Continue?" It then:
1. Sets the current active version to `deprecated`
2. Sets this version to `active` with `activatedAt` and `activatedBy`
3. Writes audit log

#### Rule set (v1: read-only JSON viewer)

Display `ruleSetJson` in a formatted, syntax-highlighted code block. For v1, editing rules requires a direct Convex dashboard update — a full rule editor is Phase 2.

#### Benchmark results

Display `benchmarkResultsJson` if present. For v1, this is uploaded as a JSON file by the QA team. Show key metrics: number of test riders, average output change vs. previous version, outlier count.

#### Fit runs under this version

A compact list of the last 20 fit sessions using `engineVersionId = this version`. Link each to the fit run trace detail.

---

## Part B — Fit Run Viewer

### B1. Fit run list

`src/app/(admin)/fit-runs/page.tsx`

**Filters**:
- User search
- Engine version filter (dropdown of all versions)
- Date range picker
- Review status: All / Needs review / Reviewed / Overridden

**Table columns**: User, bike, engine version, completed date, confidence score badge, warnings count, review status, "View trace" link.

**Confidence score badge**:
- ≥ 0.85 → green ("High")
- 0.65–0.85 → yellow ("Medium")
- < 0.65 → red ("Low — review needed")

**Review queue tab**: A secondary tab at the top showing only sessions flagged for review. This is the primary screen for `fit_specialist` admins.

### B2. Fit run trace detail

`src/app/(admin)/fit-runs/[sessionId]/page.tsx`

This is the most important screen in the fit engine module. It shows the complete, reproducible audit trail for a single fit result.

**Layout**: Two-column on desktop. Left: trace timeline. Right: summary values.

#### Left — Trace timeline

A vertical timeline of every calculation step. For v1, this maps to the existing `fitSession.result` data. Future engine versions will add structured trace events.

Each trace step shows:
- Step name (e.g. "Saddle height baseline")
- Method used (e.g. "Inseam × 0.885")
- Input values
- Output value
- Any modifier applied (e.g. "+3mm flexibility adjustment")
- Any warning generated

#### Right — Summary panel

Key fit output values with their source:
- Saddle height
- Saddle setback
- Bar reach
- Bar drop
- Stack and reach
- Crank length

Below the outputs:
- Confidence score (numeric + badge)
- Warnings list (if any)
- Engine version used
- Geometry record version used (if linked)
- Rider measurement snapshot version

#### Snapshots section

Collapsible panels showing the exact data used at fit time:

1. **Rider snapshot** — all measurement fields as they were when the fit was run
2. **Bike snapshot** — bike fields and geometry values used
3. **Engine version** — version label and rule hash

#### Manual review section (fit_specialist only)

If the fit is in review queue:
- Review notes textarea
- Override controls (if implementing overrides in v1 — keep simple: a text note field)
- "Mark reviewed" button → removes from queue, writes audit log

For v1, a manual override is an admin note only — it does not change the stored fit values. True override capability is Phase 2.

---

## Convex additions needed

### Schema additions

Add to `fitSessions` table (read the existing schema first):

```ts
engineVersionId: v.optional(v.id("engine_versions")),
confidenceScore: v.optional(v.number()),
reviewStatus: v.optional(v.union(
  v.literal("not_required"),
  v.literal("required"),
  v.literal("reviewed")
)),
reviewedBy: v.optional(v.id("users")),
reviewedAt: v.optional(v.number()),
reviewNotes: v.optional(v.string()),
```

Add indices to `fitSessions`:
```ts
.index("by_engine_version", ["engineVersionId"])
.index("by_review_status", ["reviewStatus"])
```

### New queries

```ts
export const listFitRuns = query({
  args: {
    userId: v.optional(v.id("users")),
    engineVersionId: v.optional(v.id("engine_versions")),
    reviewStatus: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireAdminUserId(ctx);
    // Query fitSessions with filters, join user name and bike brand/model
  },
});

export const getFitRunTrace = query({
  args: { sessionId: v.id("fitSessions") },
  handler: async (ctx, { sessionId }) => {
    await requireAdminUserId(ctx);
    // Return full session record + user snapshot + bike snapshot + engine version
  },
});

export const listEngineVersions = query({ ... });
export const getEngineVersionDetail = query({ ... });

// Count of fit runs per engine version (for overview widget)
export const getFitRunCountByEngineVersion = query({ ... });
```

### New mutations

```ts
export const createEngineVersion = mutation({
  args: { versionLabel: v.string(), description: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAnyRole(ctx, ["super_admin", "qa_manager"]);
    ...
  },
});

export const updateEngineVersionStatus = mutation({
  args: { versionId: v.id("engine_versions"), status: v.string() },
  handler: async (ctx, args) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "qa_manager"]);
    // If activating: deprecate current active version first
    ...
    await writeAuditLog(ctx, { action: "engine.status_change", ... });
  },
});

export const markFitRunReviewed = mutation({
  args: {
    sessionId: v.id("fitSessions"),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, reviewNotes }) => {
    const adminId = await requireAdminRole(ctx, "fit_specialist");
    await ctx.db.patch(sessionId, {
      reviewStatus: "reviewed",
      reviewedBy: adminId,
      reviewedAt: Date.now(),
      reviewNotes,
    });
    await writeAuditLog(ctx, { action: "fit_run.reviewed", ... });
  },
});
```

---

## Acceptance criteria

- [ ] Engine version list shows all versions with correct status badges
- [ ] Only one version can be `active` at a time; activating a new version deprecates the previous
- [ ] Status workflow buttons are correctly role-gated
- [ ] Fit run list is searchable and filterable by engine version and review status
- [ ] Confidence score badge is color-coded
- [ ] Fit run trace shows rider snapshot, bike snapshot, engine version used
- [ ] Manual review queue shows only sessions flagged for review
- [ ] fit_specialist can mark a run as reviewed with notes
- [ ] All mutations write audit log entries
- [ ] `npm run typecheck` passes
