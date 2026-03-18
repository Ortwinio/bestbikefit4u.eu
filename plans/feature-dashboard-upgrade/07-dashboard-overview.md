# 07 — Dashboard Overview Redesign

## Goal

Replace the current fit-session-centric dashboard with a card-based control panel showing rider summary, current bike, tire pressure summary, and recent fit activity.

## Background

The current `/dashboard/page.tsx` shows:
- A stats grid (total sessions, completed sessions, last fit date)
- A recent sessions table
- A profile-missing warning

This is a good foundation but needs to become more of a control panel. The redesign adds rider and bike identity at the top, elevates tire pressure to a visible card, and retains the sessions section.

**Data available after prompts 01–06:**
- `users.profile_image_url` — profile photo
- `users.tier` — account type
- `bikes` — list with `photoUrl`, `name`, `bikeType`
- `profiles.weightKg` — body weight
- `pressureCalculations` — most recent pressure calc per bike
- `recommendations` — available by session or user today, not yet by bike

## Dashboard Layout

```
┌─────────────────────────────────────────────┐
│  Rider Summary Card         Account badge   │
│  [avatar] Name              [Free / Pro]    │
│  Weight · Height · Inseam                   │
│  Quick actions: Edit profile | New fit      │
├───────────────────┬─────────────────────────┤
│  Current Bike Card│  Tire Pressure Card     │
│  [bike photo]     │  Front: X bar  Rear: Y  │
│  Bike name        │  [status: up to date /  │
│  Bike type        │   stale / not calculated]│
│  [Switch bike]    │  [Recalculate]          │
├───────────────────┴─────────────────────────┤
│  Recent Fit Activity                        │
│  [existing sessions table, streamlined]     │
└─────────────────────────────────────────────┘
```

## Steps

### 1. Create card subcomponents

Create these small components in `src/components/dashboard/`:

**`RiderSummaryCard.tsx`**
- Shows `ProfilePhotoUpload` (from prompt 02) sized to 64px
- Rider name (from `users`)
- Account type badge (Free / Pro pill using `users.tier`)
- Weight / Height / Inseam from `profiles` (formatted with unit preference)
- If profile is missing: show the existing yellow warning, linking to `/profile`
- Quick actions: "Edit profile" button → `/profile`, "New fit" button → `/fit`

**`CurrentBikeCard.tsx`**
- Shows the current bike. In this repo, implement in two phases: first use the most recently created bike; add `is_primary` only if the UX still needs explicit bike selection after the redesign
- Bike photo or bicycle icon placeholder
- Bike name and type
- "Switch bike" link → `/bikes` (list page)
- "Edit bike" link → `/bikes/[bikeId]/edit`
- If no bikes: "Add your first bike" CTA → `/bikes/new`

**`TirePressureCard.tsx`**
- Fetches the most recent `pressureCalculations` record for the current bike
- Shows: Front pressure (bar / psi per unit preference), Rear pressure
- Status:
  - No data: "Not calculated yet" + "Calculate now →" button
  - Has data: show values + last calculated date
  - Stale (after prompt 09 adds staleness): yellow "Recalculate recommended" badge
- "Recalculate" button → `/pressure-calculator?bikeId=...`

**`FitActivitySection.tsx`**
- Streamlined version of the current sessions table
- Show last 3 sessions max, with a "View all" link
- Retain the status icons and route logic from the current implementation

### 2. Rewrite `src/app/(dashboard)/dashboard/page.tsx`

Replace the existing page content with the new layout using the four card components above. The layout should be:
- Mobile: single column stack
- Desktop: two-column grid for the bike + pressure cards, full-width for rider and activity sections

Retain: auth/loading state handling, the profile-missing check (now inside `RiderSummaryCard`), localized messages.

### 3. Add a `bikes.is_primary` field only if fallback selection is insufficient

Check `convex/schema.ts`. If a most-recent fallback is not sufficient, add `is_primary: v.optional(v.boolean())` and a `setPrimary` mutation in `convex/bikes/mutations.ts` that:
1. Sets `is_primary = false` on all other bikes for the user
2. Sets `is_primary = true` on the specified bike

Add a "Set as primary" button on the bike list page and detail page.

### 4. Add `getMyCurrentBike` query

In `convex/bikes/queries.ts`, add a query that returns the chosen current bike for the current user. If no explicit primary field exists, return the most recently created bike.

### 5. i18n

Add translation keys for all new dashboard strings. Add to both locale files:
- `dashboard.riderCard.title` — "Rider profile"
- `dashboard.riderCard.editProfile` — "Edit profile"
- `dashboard.riderCard.newFit` — "New fit"
- `dashboard.bikeCard.title` — "Current bike"
- `dashboard.bikeCard.switchBike` — "Switch bike"
- `dashboard.bikeCard.noBike` — "No bike yet"
- `dashboard.bikeCard.addBike` — "Add your first bike"
- `dashboard.pressureCard.title` — "Tire pressure"
- `dashboard.pressureCard.notCalculated` — "Not calculated yet"
- `dashboard.pressureCard.calculate` — "Calculate now"
- `dashboard.pressureCard.recalculate` — "Recalculate"
- `dashboard.pressureCard.front` — "Front"
- `dashboard.pressureCard.rear` — "Rear"
- `dashboard.activitySection.title` — "Recent fit sessions"
- `dashboard.activitySection.viewAll` — "View all"

## Acceptance Criteria

- [ ] Dashboard shows Rider Summary, Current Bike, Tire Pressure, and Fit Activity sections
- [ ] Profile photo appears in the rider summary card
- [ ] Account type badge (Free / Pro) shows in the rider summary card
- [ ] Current bike is identified correctly (primary or most recent)
- [ ] Tire pressure card shows most recent calculation or a "not calculated" state
- [ ] Mobile layout stacks all cards vertically
- [ ] `npm run typecheck` passes
