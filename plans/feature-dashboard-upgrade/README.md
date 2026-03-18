# Plan: Dashboard Upgrade — Bike Setup Platform

## Goal

Transform the dashboard from a fit-session tracker into a central control panel for rider identity, bike management, tire pressure optimization, and fit recommendations. The app shifts from a single-purpose fit tool to a unified bike setup platform.

## Background

The current dashboard shows fit session history and basic stats. It lacks:
- Rider identity (no profile photo, no weight field)
- Bike visual management (no bike photos displayed)
- Tire pressure visibility within bike context
- A settings page (language is buried in the sidebar)
- Theme switching
- Account type awareness (free vs. paid)
- Any integration surface (Strava)

The Convex schema already has strong foundations: `bikes` has a `photoUrl` field, `profiles` already stores many measurements (including optional `weightKg`), `users` has a `tier` field, and the tire-pressure module already introduced `wheelsets`, `tireSetups`, `pressureProfiles`, and `pressureCalculations`. The remaining gap is mostly UI, missing user-preference fields (`theme_preference`, `profile_image_url`, optionally `unit_preference` on users), and missing dashboard connections between bikes, pressure, and fit outputs.

## Scope

**Phase 1 — Core dashboard upgrade:**
- Profile photo upload + display
- Bike photo upload + display
- Body weight as first-class metric
- Settings page (language, theme, account type)
- Dark/light/system theme switch
- Tire pressure block inside bike detail
- Redesigned dashboard overview

**Phase 2 — Bike-integrated pressure:**
- Pressure recalculation triggers (weight, tire width, tire system changes)
- Current vs. recommended pressure comparison UI
- Per-bike pressure history

**Phase 3 — Fit-pressure interaction layer:**
- Pressure influence on comfort/stability/performance scores
- Warning flags in fit recommendations
- Explanation copy per scenario

**Phase 4 — Strava integration:**
- OAuth connect/disconnect
- Basic ride import and terrain inference
- Feed into tire pressure suggestions

**Out of scope:**
- AI photo analysis / bike image annotation
- Full billing portal (account type is displayed; billing redirects externally)
- Route-aware recommendations beyond basic terrain inference
- Advanced premium gating enforcement (display only in this plan)

## Architecture Notes

**Key existing schema facts (do not re-derive):**
- `users`: has `tier` ("free" | "pro" | "premium"), but NO `theme_preference`, NO `profile_image_url`
- `profiles`: has `weightKg` as optional — exists but is not surfaced prominently in UI
- `bikes`: has `photoUrl` (optional string URL) — exists but is only lightly surfaced today
- `pressureCalculations`: captures rider weight in `inputSnapshot.bodyWeightKg`
- `recommendations`: is the fit output table (`bike_fit_outputs` equivalent)
- `tire-pressure` dashboard pieces already exist: pressure wizard route, bike pressure summary/section components, and `pressureCalculations.getLatestForBike`
- File storage: Convex provides `ctx.storage` — use Convex file storage for images (not external CDN) to avoid adding new infra
- i18n lives in `src/i18n/messages/en.ts` and `src/i18n/messages/nl.ts`, not JSON locale files

**Existing pages (do not recreate):**
- `/dashboard` — main page (to be redesigned)
- `/bikes` — list page
- `/bikes/new` — create form
- `/bikes/[bikeId]/edit` — edit form
- `/pressure-calculator` — standalone calculator (to be integrated, not removed)
- `/profile` — profile form

**New pages to create:**
- `/settings` — settings hub
- `/bikes/[bikeId]` — bike detail view (currently missing; edit page exists but no read-only detail)

## Implementation Notes

- Reuse existing pressure components and queries where possible instead of recreating them under new names.
- Extend existing dashboard navigation carefully: the language switch currently lives in the sidebar and mobile header and is part of the active UX.
- Any prompt that references `messages/en.json` or `messages/nl.json` should be interpreted as `src/i18n/messages/en.ts` and `src/i18n/messages/nl.ts`.
- Any prompt that references `bikes.photo` should be interpreted as `bikes.photoUrl`.
- Before adding new recommendation-by-bike behavior, first add an explicit bike lookup strategy in the recommendation layer; the current repo has `by_session`, `by_user`, and `by_id` queries only.

## Rollout Phases

| Phase | Prompts | Focus |
|-------|---------|-------|
| 1A | 01–03 | Schema + file storage + image uploads |
| 1B | 04–05 | Weight promotion + settings page + theme |
| 1C | 06–07 | Dashboard overview redesign |
| 2 | 08–09 | Pressure inside bikes + recalculation triggers |
| 3 | 10–11 | Fit-pressure interaction |
| 4 | 12 | Strava OAuth MVP |

## Acceptance Criteria

- [ ] User can upload and see a profile photo in the sidebar and dashboard
- [ ] Each bike can have a photo shown in bike cards and detail view
- [ ] Body weight is required for advanced pressure calculations (soft warning if missing)
- [ ] Weight change marks pressure recommendations stale and prompts recalculation
- [ ] Tire pressure block appears inside each bike's detail view
- [ ] Settings page exists at `/settings` with language, theme, and account sections
- [ ] Theme switch (light/dark/system) persists in Convex `users.theme_preference`
- [ ] Dashboard overview shows rider summary, current bike, pressure summary, and fit summary cards
- [ ] Free vs. paid account type is visible in settings and dashboard
- [ ] Strava connect/disconnect works (Phase 4)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No lint errors (`npm run lint`)

## Prompts

| # | File | Description |
|---|------|-------------|
| 01 | `01-schema-image-storage.md` | Add missing schema fields; wire Convex file storage |
| 02 | `02-profile-photo.md` | Profile photo upload, display in sidebar and dashboard header |
| 03 | `03-bike-photo.md` | Bike photo upload and display in bike cards and detail view |
| 04 | `04-weight-promotion.md` | Promote weight to first-class metric in profile and pressure engine |
| 05 | `05-settings-page.md` | Settings page with language, theme switch, and account type |
| 06 | `06-theme-switch.md` | Dark/light/system theme with Convex persistence and localStorage fallback |
| 07 | `07-dashboard-overview.md` | Redesign dashboard overview with rider, bike, pressure, fit cards |
| 08 | `08-pressure-in-bikes.md` | Tire pressure block inside bike detail; current vs. recommended comparison |
| 09 | `09-pressure-triggers.md` | Staleness detection and recalculation triggers for weight/tire changes |
| 10 | `10-fit-pressure-layer.md` | Pressure influence on comfort/stability/performance scores in fit output |
| 11 | `11-fit-pressure-warnings.md` | Warning flags and explanation copy in recommendations |
| 12 | `12-strava-integration.md` | Strava OAuth connect/disconnect and basic ride import |
