# Step 10 — Releases Management

## Goal

Build the release management module: creating and managing product releases, linking feedback items and engine versions to releases, managing status workflow from draft to live, and generating release notes.

---

## Pre-requisites

- Steps 01–03 complete
- `releases` and `release_items` tables in schema (step 02)
- `createRelease`, `updateReleaseStatus` mutations in admin backend (step 03)
- `listReleases`, `getReleaseDetail` queries in admin backend (step 03)
- Feedback items exist (step 09) so they can be linked

---

## 1. Release list page

`src/app/(admin)/releases/page.tsx`

**View tabs**:
- All
- App releases
- Engine releases
- Geometry releases
- Content releases

**Status filter**: All / Draft / In QA / Approved / Scheduled / Rolling out / Live / Rolled back

**Table columns**:
- Release name
- Type badge (color-coded: app=blue, engine=purple, geometry=green, content=gray)
- Version label
- Status badge
- Owner
- Rollout date (or scheduled date)
- Linked items count (bugs + features)
- Actions: "View" link

**"New release" button** (qa_manager, ops_admin, super_admin) → opens a dialog (see §3).

---

## 2. Release detail page

`src/app/(admin)/releases/[releaseId]/page.tsx`

**Top bar**: release name, type badge, status badge, version label.

**Tabs**:
1. Overview
2. Linked items
3. Release notes
4. Rollout & health

---

### Tab 1 — Overview

**Left column — Metadata**:
- Name, version label, type, owner
- Description / scope (markdown preview)
- Target audience
- Rollout date (date picker if in draft/approved)
- QA status badge + "Update QA status" button
- Created by, created date

**Right column — Status workflow**

Status workflow panel. Only show the valid next-state button:

| Current status | Next actions | Required role |
|---|---|---|
| `draft` | "Submit for QA" | qa_manager, ops_admin |
| `in_qa` | "Mark QA passed" / "Mark QA failed" | qa_manager |
| `approved` | "Schedule rollout" / "Go live now" | qa_manager, super_admin |
| `scheduled` | "Start rollout" / "Cancel" | qa_manager, super_admin |
| `rolling_out` | "Mark live" / "Roll back" | qa_manager, super_admin |
| `live` | "Roll back" / "Archive" | super_admin |
| `rolled_back` | "Archive" | super_admin |

**Rule**: A release cannot be moved to `approved` unless:
- `qaStatus = "passed"`
- `ownerId` is set
- `rollbackPlan` is not empty (shows a warning if missing)

"Go live now" requires a final confirmation dialog: "This will mark the release as live. This action is logged."

All status transitions write `admin_audit_logs` entries.

---

### Tab 2 — Linked items

Two sections:

**Bugs fixed in this release**:
A searchable list of `feedback_items` with `type = "bug"` linked to this release via `release_items`. Columns: title, severity, status badge, reporter. "Remove" button. "Link existing bug" button → opens a search dialog over open feedback items.

**Features shipped in this release**:
Same but for `type = "feature_request"`. Includes upvote count.

**At the bottom**: "Total linked items: X bugs, Y features"

When a release moves to `live`:
- Automatically update all linked `feedback_items` to `status = "released"`
- Trigger `notifyRelease` action (see §5) to send dashboard messages to users who reported the linked items

---

### Tab 3 — Release notes

A markdown editor for the release notes. Preview toggle shows formatted output.

Release notes template (pre-fill when creating):

```markdown
## What's new in [Release Name]

### New features
-

### Bug fixes
-

### Technical changes
-
```

The notes are stored in `releases.releaseNotes`. When the release goes live, the notes are included in the auto-generated dashboard message (if opted in — see checkbox on this tab: "Send release announcement to affected users").

---

### Tab 4 — Rollout & health

**Engine impact** (for engine releases):
- Engine version linked: version label + link to engine detail
- Benchmark comparison vs. previous version (read from `benchmarkResultsJson`)

**Geometry impact** (for geometry releases):
- Count of geometry records published in this release
- Count of bikes affected (bikes linked to updated geometry records)
- "Would trigger re-fit for N users" estimate

**Post-live health** (populated after release goes live):
- Support tickets opened in 7 days before vs. after live date
- Fit confidence score average before vs. after (for engine releases)
- Message open rates for release announcement

For v1, the health metrics are manual inputs or simple counts from existing queries. Automated analytics comparison is Phase 2.

---

## 3. New release dialog

Simple form, creates a `status = "draft"` release:

- Name (required)
- Type (dropdown: app / fit_engine / geometry_data / content / integration / internal)
- Version label (optional)
- Description (optional)
- Rollout date (optional date picker)
- Owner (defaults to current admin)

On create: navigates directly to the new release detail page.

---

## 4. Release calendar view

`src/app/(admin)/releases/calendar/page.tsx`

A monthly calendar view showing releases by `rolloutDate` or `liveAt`. Each day cell shows badges for any releases on that date. Clicking a release badge navigates to its detail page.

For v1, use a simple grid calendar with CSS — no external calendar library dependency.

---

## 5. Convex actions — notify users on release

```ts
// convex/admin/actions.ts
export const notifyRelease = action({
  args: {
    releaseId: v.id("releases"),
    sendToAffectedUsers: v.boolean(),
    sendGeneralAnnouncement: v.boolean(),
    announcementTargets: v.optional(v.array(v.object({
      targetType: v.string(),
      targetValue: v.optional(v.string()),
    }))),
  },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    // 1. Get release + release notes
    // 2. If sendToAffectedUsers: find all users who reported linked feedback items,
    //    create dashboard_messages with type "support_reply" for each,
    //    body: "Your reported issue has been fixed in [release name]."
    // 3. If sendGeneralAnnouncement: create dashboard_messages with release notes
    //    targeted at the specified audience segments
    // 4. Write audit log
  },
});
```

---

## 6. Convex additions

### Additional queries

```ts
export const listReleases = query({
  args: {
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  ...
});

export const getReleaseDetail = query({
  args: { releaseId: v.id("releases") },
  // Returns release + linked feedback items + engine version + owner name
  ...
});

export const getReleaseCalendarData = query({
  args: { year: v.number(), month: v.number() },
  // Returns releases with rolloutDate or liveAt in the given month
  ...
});
```

### Additional mutations

```ts
export const addItemToRelease = mutation({
  args: { releaseId, feedbackItemId },
  ...
});

export const removeItemFromRelease = mutation({
  args: { releaseId, feedbackItemId },
  ...
});

export const updateReleaseNotes = mutation({
  args: { releaseId, releaseNotes: v.string() },
  ...
});

export const updateReleaseQaStatus = mutation({
  args: { releaseId, qaStatus: v.string() },
  ...
});

export const updateReleaseStatus = mutation({
  args: { releaseId, status: v.string(), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const adminId = await requireAnyRole(ctx, ["qa_manager", "super_admin"]);
    const release = await ctx.db.get(args.releaseId);

    // Guard: cannot approve without passing QA
    if (args.status === "approved" && release?.qaStatus !== "passed") {
      throw new Error("Cannot approve: QA has not passed.");
    }

    // Guard: cannot go live without rollback plan
    if (args.status === "live" && !release?.rollbackPlan) {
      throw new Error("Cannot go live: rollback plan is required.");
    }

    const patch: Record<string, unknown> = { status: args.status };
    if (args.status === "live") patch.liveAt = Date.now();
    if (args.status === "rolled_back") patch.rolledBackAt = Date.now();
    if (args.status === "approved") {
      patch.approvedBy = adminId;
      patch.approvedAt = Date.now();
    }

    await ctx.db.patch(args.releaseId, patch);
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "release.status_change",
      targetType: "release",
      targetId: args.releaseId,
      payload: { from: release?.status, to: args.status },
      reason: args.reason,
    });
  },
});
```

---

## Acceptance criteria

- [ ] Release list shows all releases with correct type and status badges
- [ ] New release form creates a draft and navigates to detail page
- [ ] Status workflow buttons are correctly sequenced and role-gated
- [ ] Cannot approve without QA passed; cannot go live without rollback plan
- [ ] Linked items tab shows connected bugs and features; can add/remove
- [ ] When release goes live: linked feedback items automatically set to "released"
- [ ] Release notes editor saves markdown and previews correctly
- [ ] `notifyRelease` action sends dashboard messages to affected users
- [ ] Release calendar shows releases on their rollout/live dates
- [ ] All status transitions write audit log entries
- [ ] `npm run typecheck` passes
