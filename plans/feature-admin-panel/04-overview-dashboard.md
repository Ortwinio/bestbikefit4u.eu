# Step 04 — Overview Dashboard

## Goal

Build the admin overview page at `/admin/overview`: an operational command center showing real KPIs, health widgets, queue lengths, and quick-action links. All data comes from Convex queries; nothing is mocked.

---

## Pre-requisites

- Steps 01–03 complete (auth, schema, backend queries including `getOverviewStats`)
- Admin layout and sidebar are rendering correctly

---

## Page layout

`src/app/(admin)/overview/page.tsx`

The page is a responsive grid of widgets, organized in four rows:

```
Row 1 — KPI strip (8 tiles)
Row 2 — Queue panels (3 panels side by side)
Row 3 — Health widgets (2 wide panels)
Row 4 — Recent activity feed
```

Use the shared Prototyper-style surface for all widgets: `Card`, `CardHeader`, `CardContent`, `Button`, `Progress`, `Tooltip`, and tokenized status pills where needed.

---

## Row 1 — KPI stat tiles

Use a `StatTile` pattern: a small card with a label, a large number, and an optional trend indicator (↑ / ↓ / —).

| Tile | Value | Click destination |
|---|---|---|
| Total users | Count of all user records | `/admin/users` |
| Free users | Count where `tier = "free"` | `/admin/users?tier=free` |
| Pro / Premium users | Combined paid count | `/admin/users?tier=pro` |
| Completed fits | Count of `fitSessions` with results | `/admin/fit-runs` |
| Active Strava connections | Count where integration `accessStatus = "active"` | `/admin/users?strava=connected` |
| Open feedback items | Count where `status = "new"` or `"triaged"` | `/admin/feedback` |
| Active releases | Count where `status = "rolling_out"` or `"live"` | `/admin/releases` |
| Low-confidence fits | Count of fit sessions with confidence below threshold | `/admin/fit-runs?confidence=low` |

All eight tiles come from a single `getOverviewStats` Convex query.

---

## Row 2 — Queue panels

Three panels showing items requiring attention:

### Panel A — Manual review queue
Fit runs flagged for manual review. Show count + up to 5 most recent items as a compact list (user name, bike, date). "View all" links to `/admin/fit-runs?review=required`.

### Panel B — Open feedback
Most recent 5 `feedback_items` with `status = "new"`. Show title, type badge, reporter name, time ago. "View all" links to `/admin/feedback`.

### Panel C — Release health
For each release with `status = "rolling_out"` or `"live"` in the last 30 days: name, status badge, live date, and a row with "support tickets opened since live" count. Links to `/admin/releases/[id]`.

---

## Row 3 — Health widgets

### Widget A — Geometry coverage
A compact breakdown of brands with at least one geometry record marked `status = "active"` vs. brands with no active records. Show: active brands count, total brands count, a simple progress bar. Link to `/admin/geometry`.

### Widget B — Fit engine health
The currently active engine version label, its activation date, and the number of fit runs completed under this version. Show a "draft" indicator if a new engine version is in `status = "qa"`. Link to `/admin/fit-engine`.

---

## Row 4 — Recent activity feed

A chronological list of the last 20 `admin_audit_logs` entries. Show: action label, target, admin user name, time ago. This is a simple read-only feed — no interaction needed on the overview.

---

## Convex query updates needed

Extend `getOverviewStats` in `convex/admin/queries.ts` to return:

```ts
{
  totalUsers: number,
  freeUsers: number,
  paidUsers: number,
  completedFits: number,
  stravaConnected: number,
  openFeedbackCount: number,
  activeReleases: number,
  lowConfidenceFits: number,
  manualReviewQueueCount: number,
  recentFeedback: FeedbackItem[],
  activeReleasesList: Release[],
  geometryBrandCount: number,
  geometryActiveBrandCount: number,
  activeEngineVersion: EngineVersion | null,
  draftEngineVersion: EngineVersion | null,
}
```

Add a separate query `getRecentAuditLogs` that returns the last 20 audit entries with admin user display names joined.

---

## Component structure

```
src/app/(admin)/overview/
  page.tsx               — data fetching, layout grid
  StatTile.tsx           — reusable stat tile (label, value, trend, href)
  QueuePanel.tsx         — reusable queue panel (title, items list, view-all link)
  ActivityFeed.tsx       — audit log feed
```

---

## Styling guidance

- KPI tiles: `Card` with a large (`text-3xl`) number and small label below
- Queue panels: equal-width three-column grid on desktop, stacked on mobile
- Health widgets: two-column grid, each spanning half width
- Use tokenized status pills for severity and release states unless a dedicated Prototyper-compatible badge primitive has been added first
- Use tokenized placeholder blocks for loading states unless a dedicated Prototyper-compatible skeleton primitive has been added first

---

## Acceptance criteria

- [ ] All 8 KPI tiles show real counts from Convex (not zero/hardcoded)
- [ ] Each tile links to the correct filtered list view
- [ ] Queue panels show live items from the database
- [ ] Empty states are handled gracefully ("No items in review queue")
- [ ] Activity feed renders the last 20 audit log entries
- [ ] Page is responsive: single column on mobile, grid on desktop
- [ ] Loading state uses the approved shared loading placeholder pattern
- [ ] `npm run typecheck` passes
