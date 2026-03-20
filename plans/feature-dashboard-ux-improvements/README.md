# Dashboard UX Improvements

## Goal

Improve the dashboard with four linked enhancements that give users a richer view of their fitting history, bike notes, tire pressure experience, and weight-aware tire pressure recalculation, while making lifecycle UX decisions explicit for destructive actions.

## Background

The current dashboard has these navigation items: Dashboard, New Fit Session, My Bikes, Tire Pressure, Profile, Settings. Several gaps exist:

- There is no place to browse fitting history across bikes in one view
- Bikes have no free-text notes field for personal observations
- The tire pressure screen is wizard-only; there is no per-bike summary of past calculations
- The profile has `weightKg` in the Convex schema but no UI to enter it or trigger a tire pressure recalculation when it changes

Quality findings from current repo review:

- **Bike deletion exists today**, but the UX is weak:
  - Desktop bikes list and bike edit page both expose delete
  - The flow uses `window.confirm` / `alert` instead of the app dialog + toast pattern
  - `convex/bikes/mutations.remove` currently deletes only the bike row, with no explicit cascade or guard against related bike profiles, wheelsets, tire setups, fit sessions, recommendations, or pressure calculations
- **Bike fitting deletion does not exist today**
  - No fit-session delete/archive mutation was found
  - No delete action is exposed from fit history, results, or dashboard surfaces
- **Tire pressure advice deletion does not exist today**
  - No delete mutation was found for `pressureCalculations`
  - No delete action is exposed from the pressure wizard or bike pressure summary UI
- The current plan referenced a report route pattern that does not match the app as implemented; current results pages use `/fit/[sessionId]/results`
- The steps were framed as independent, but the UI work depends on Step 01 making clear lifecycle decisions for bikes, fit sessions, and pressure calculations

## Scope

### In Scope

1. **Bike Fitting history screen** — new "Bike Fitting" nav item (`/fit-history`) showing all bikes with their fit sessions over time, linked to their recommendations
2. **My Bikes enhancements** — fitting history timeline per bike + free-text `notes` field per bike
3. **Tire Pressure overview** — per-bike pressure summary card showing the latest calculation, plus a `userNotes` field on `pressureCalculations` for rider feedback
4. **Profile weight** — expose `weightKg` in the profile UI; when the user updates their weight, prompt them to recalculate tire pressure for each bike; auto-append a note "Based on updated weight of X kg" to any new calculation triggered this way
5. **Lifecycle UX decisions** — harden bike deletion UX and explicitly define whether fit sessions and pressure calculations remain non-deletable in this initiative or receive safe delete/archive support

### Out of Scope

- Re-running the bike fitting engine from within the history screen (link to start new session instead)
- Historical pressure chart visualisation (show cards list only)
- Bulk edit of notes
- A silent introduction of destructive actions without an explicit backend ownership/cascade policy

## Lifecycle Decision For This Plan

This plan should not leave destructive actions ambiguous.

- **Bike**: keep delete in scope, but upgrade it to a first-class destructive flow and make the backend behavior explicit
- **Bike fitting session**: no delete/archive exists today; this plan must either add a safe delete/archive contract in Step 01 or explicitly defer it and avoid dead-end delete affordances in the new history UI
- **Tire pressure advice**: no delete exists today; because Step 04 only adds a latest-summary overview, it is acceptable to defer deletion in this plan, but the plan must state that clearly

## Schema Changes Required

| Table | Change |
|---|---|
| `bikes` | Add `notes: v.optional(v.string())` |
| `pressureCalculations` | Add `userNotes: v.optional(v.string())` and `autoNoteSource: v.optional(v.string())` |

> Note: `profiles.weightKg` and `profiles.weightUpdatedAt` already exist in the schema — only the UI is missing.

## Approach

The steps are sequential. Step 01 defines the data and lifecycle contract that later UI steps depend on.

1. **Schema + Convex layer + lifecycle contract** — Migrate schema, add/update mutations and queries, and define destructive-action policy
2. **Bike Fitting history screen** — New route, sidebar entry, page component
3. **My Bikes enhancements** — Add notes field + fitting history section to bike detail page + harden bike deletion UX
4. **Tire Pressure overview** — Per-bike pressure summary on the pressure calculator page + userNotes on calculations
5. **Profile weight + recalculate flow** — Weight input in profile form + recalculate dialog on weight change
6. **i18n** — All new strings in `en.ts` and `nl.ts`

## Progress

- [x] Step 01: Schema + Convex layer + lifecycle contract
- [x] Step 02: Bike Fitting history screen
- [x] Step 03: My Bikes enhancements
- [x] Step 04: Tire Pressure overview
- [x] Step 05: Profile weight + recalculate flow
- [x] Step 06: Final i18n and regression sweep

## Acceptance Criteria

- [x] "Bike Fitting" appears in the sidebar and leads to a page listing all bikes with their fit session history
- [x] Each bike on `/bikes/[bikeId]` shows a "Fitting History" section with past sessions and recommendations
- [x] Each bike has a "Notes" text area that saves to Convex and persists across sessions
- [x] The Tire Pressure page shows a per-bike summary card with the most recent recommended pressure
- [x] Each pressure calculation can have a user note; the note is editable inline
- [x] The Profile page has a weight field (kg); saving a different weight triggers a dialog asking if the user wants to recalculate tire pressure
- [x] Selecting "Yes" runs a recalculation for each bike that has an active tire setup and saves a new `pressureCalculation` with `autoNoteSource` set
- [x] All new UI strings are available in English and Dutch
- [x] Bike deletion uses the app’s destructive dialog pattern and the backend either cascades safely or blocks deletion with a user-facing explanation
- [x] The plan explicitly documents the status of fit-session deletion and pressure-calculation deletion, so the new history/overview screens do not imply unsupported management actions
