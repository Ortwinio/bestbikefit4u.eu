# Prompt 05 — Audit log, roles, and SEO validation

## Context

Prompts 01–04 built the schema, public integration, and admin UI for creating, editing, publishing, and previewing guides. This prompt adds the governance layer: audit log, role enforcement, and SEO validation completeness.

Read the plan README before starting. Complete Prompts 01–04 first.

## Goal

1. Every state-changing action on a guide page writes an audit log entry
2. Role-based access is enforced at the Convex mutation level (not just UI)
3. SEO checklist in the admin panel is fully wired and accurate
4. Final QA pass: all acceptance criteria from the README are verified

## What to implement

### 1. Audit log

If a general audit log table does not already exist in `convex/admin/`:

Create `guideAuditLog` table in Convex schema:
```
{
  action: string,           // "create" | "update" | "publish" | "unpublish" | "delete" | "slug_change" | "redirect_create"
  resourceType: "guide",
  resourceId: Id<"guidePages">,
  fieldChanges: Array<{ field: string, oldValue: any, newValue: any }>,
  userId: string,
  userEmail: string,
  timestamp: number,
  metadata: any             // optional extra context
}
```

Update all mutations from Prompt 01 to write audit records:
- `createGuide`: action = `create`, no fieldChanges
- `updateGuide`: action = `update`, fieldChanges = diff between old and new values for each changed field
- `publishGuide`: action = `publish`
- `unpublishGuide`: action = `unpublish`
- `changeSlug`: action = `slug_change`, fieldChanges = `[{ field: "slug", oldValue, newValue }]`
- `createRedirect`: action = `redirect_create`

Add a `getGuideAuditLog({ guideId })` query (admin only) that returns all audit entries for a guide, sorted by timestamp descending.

### 2. Audit log UI

Add an "Activity" tab (or collapsible section) to the edit guide form:
- Shows a timeline of all audit events for that guide
- Each entry: timestamp, user email, action label (human-readable), changed fields summary
- Example: "ortwin@bestbikefit4u.eu published this guide — 2026-04-11 14:30"
- Example: "anne@bestbikefit4u.eu updated h1.en: 'Old heading' → 'New heading' — 2026-04-11 09:15"
- Show up to 50 entries (no pagination needed in v1)

### 3. Role enforcement at mutation level

All mutations must enforce roles at the Convex level, not just the UI:
- `createGuide`: editor or admin
- `updateGuide`: editor or admin (but only admin can update a published guide's slug)
- `publishGuide`: admin only
- `unpublishGuide`: admin only
- `changeSlug`: admin only (for published guides)
- `createRedirect`: admin only
- `deleteRedirect`: admin only

Use the existing `requireUserId()` pattern from `convex/lib/authz.ts`. Add a `requireAdminRole()` helper if it does not already exist.

### 4. SEO checklist — final wiring

Verify the SEO checklist panel (implemented in Prompt 03) is fully wired with live data:

Each check must reflect the current form state (not the last-saved state):
- H1 (EN and NL separately): pass if filled, warn if empty
- Meta title (EN and NL): pass if filled and ≤ 60 chars, warn if empty or over limit
- Meta description (EN and NL): pass if 50–160 chars, warn if empty, warn if over 160
- Slug: pass if set and valid format, fail if conflicts with existing (query result)
- Featured image alt: pass if no image set, or if alt is filled; warn if image set but alt empty
- robotsIndex: pass if true; show info note if false (not a warning — intentional is fine)
- FAQs: info nudge if empty ("FAQ schema won't be generated without FAQs")

The checklist runs live as the user types (using React controlled state, not saved values).

### 5. Acceptance criteria QA checklist

Run through all 15 acceptance criteria from the README and record pass/fail for each.

Write the results to `plans/feature-cms-guide-pages/qa-report.md`:
```
# CMS Extension v1 — QA Report
Date: YYYY-MM-DD
Tester: Claude

| AC-ID | Criterion summary | Result | Notes |
|---|---|---|---|
| AC-01 | Editor creates guide without code | Pass | |
...
```

Any failures must be fixed before this prompt is considered complete.

## Validation

- Create a guide, edit it, publish it, unpublish it, change its slug — verify audit log shows all events
- Attempt to publish via a direct Convex mutation call using an editor token — verify it is rejected at the mutation level
- Verify SEO checklist updates in real time as fields are filled
- Complete the full QA checklist and confirm all 15 AC pass
- `npx tsc --noEmit` must pass
- All existing tests must pass
