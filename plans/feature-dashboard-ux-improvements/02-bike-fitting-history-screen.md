# Step 02 — Bike Fitting History Screen

## Goal

Add a new "Bike Fitting" navigation item that leads to a screen showing all of the user's bikes with their fitting history grouped by bike, ordered newest first.

This step should not introduce delete/archive affordances unless Step 01 explicitly added backend support for fit-session lifecycle actions.

## Sidebar Change

File: `src/components/layout/DashboardSidebar.tsx`

Add a new nav item between "New Fit Session" and "My Bikes":

```ts
{
  href: withLocalePrefix("/fit-history", locale),
  label: messages.dashboard.nav.bikeFitting,
  icon: ClipboardList, // from lucide-react
  matchExact: false,
}
```

Also update `src/components/layout/HeaderMobileMenu.tsx` — the mobile menu receives nav labels from `Header` via the `labels.dashboardNav` prop (added in a previous session). Add the new entry in the same pattern.

## New Route

Create `src/app/(dashboard)/fit-history/page.tsx`:

- `"use client"`
- Query: `useQuery(api.fitSessions.queries.getAllSessionsWithBikes)`
- Groups results by `bikeId`
- Renders a `<BikeWithFitHistory>` card for each bike, sorted by the most recent session

### `<BikeWithFitHistory>` Component

Create `src/components/bikes/BikeWithFitHistory.tsx`:

Props: `{ bike, sessions: Array<{ session, recommendation }> }`

Renders:
- Bike name + type badge
- Sorted list of sessions (newest first), each showing:
  - Date of the session (`completedAt` or `createdAt`)
  - Session status badge
  - If recommendation exists: saddle height, handlebar drop, confidence score chip
  - Link: "View full report" → `/fit/[sessionId]/results`
- "Start new fit session" link if the list is empty

Optional only if Step 01 implements it:
- Overflow menu or destructive action for archive/delete

If fit-session delete/archive remains deferred, do not ship a disabled trash icon or a vague "manage" CTA.

Use `Card` + `CardHeader` + `CardContent` from `@/components/ui`.

### Empty State

If the user has no fit sessions at all, show an `EmptyState` component (or the existing `LoadingState`/`ErrorState` pattern) with a CTA to start their first fit session.

## i18n Keys Needed (Step 06 will add them)

```
dashboard.nav.bikeFitting
dashboard.fitHistory.title
dashboard.fitHistory.emptyTitle
dashboard.fitHistory.emptyDescription
dashboard.fitHistory.emptyCtaLabel
dashboard.fitHistory.sessionDate
dashboard.fitHistory.viewReport
dashboard.fitHistory.startNewSession
dashboard.fitHistory.saddleHeight
dashboard.fitHistory.handlebarDrop
dashboard.fitHistory.confidence
```

## Acceptance Criteria

- [ ] "Bike Fitting" appears in the sidebar (desktop and mobile) between "New Fit Session" and "My Bikes"
- [ ] `/fit-history` (and localised versions) renders without errors
- [ ] Sessions are grouped by bike, newest first
- [ ] Each session card shows date, status, and key measurements when a recommendation exists
- [ ] "View full report" links to the recommendation detail page
- [ ] Empty state renders correctly and links to start a new session
- [ ] No unsupported delete/archive affordance is shown for fit sessions
