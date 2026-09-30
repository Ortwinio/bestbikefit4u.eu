# 45 — Delete a bike with all its data from the garage

Request (Ortwin, 2026-09-30): a button in the bike garage to delete an existing bike with all its
settings. Decision: **delete everything**, including the bike's fit sessions, recommendations and reports.

Today `api.bikes.mutations.remove` (convex/bikes/mutations.ts:555) exists, is only reachable from
`/bikes/[bikeId]/edit`, and **refuses** when the bike has fit sessions. It already deletes pressure
calculations/profiles, bike profiles, wheelsets + tire setups and photos (+ storage).

## Build

1. **Garage UI** (`/bikes` overview card and the bike detail page): a secondary "Verwijder fiets" action
   (trash icon + text, not the primary button). Opens a confirmation dialog:
   - states exactly what will be deleted: the bike, its settings (geometry, wheels/tires, tire pressure,
     gearing and calculator settings, photos, fit pass code) **and** N fit sessions with their advice and
     PDF reports (show the real count);
   - "Dit kan niet ongedaan worden gemaakt";
   - the user must type the bike's name to enable the red "Definitief verwijderen" button;
   - focus trap, Esc closes, 44px targets, NL/EN copy in the owner's dictionary.
   After deleting: toast "Fiets verwijderd" and back to the garage; the dashboard and menus update.
2. **Backend:** extend deletion to cascade over **every** table that references the bike or its fit
   sessions (grep `convex/schema.ts` for `bikeId` and `sessionId`/`fitSessionId`: fit sessions,
   questionnaire responses, recommendations, reports and report rate-limit rows, email/report logs,
   gearing sessions, saddle-width results, bike passport/public fit codes, calculator states if present,
   photos and their storage files, anything else). Ownership check stays (`requireBikeOwner`). If the
   total can exceed Convex mutation limits, delete in batches via an internal mutation scheduled until
   done, and hide the bike immediately (e.g. `deletedAt`) so the UI is consistent. Keep the old
   "has fitting history" refusal only if the user did not confirm (the new mutation takes an explicit
   `confirmName` that must match the bike name server-side).
   Consider the user's *other* bikes and profile untouched; do not delete shared/profile data.
3. **Tests:** Convex tests for the cascade (every related table empty afterwards for that bike, other bikes
   and other users untouched, wrong owner rejected, wrong confirm name rejected, batching path); UI tests
   for the dialog (count shown, button disabled until the name matches, error state).

Ownership for this task: A owns `src/app/(dashboard)/bikes/*`, `src/components/bikes/*`,
`src/components/features/bikes/*` UI for the delete action and `convex/bikes/mutations.ts` + a new
deletion module (D is informed). Schema change only if needed for `deletedAt` (additive; tell the lead).
Screenshots NL/EN 1440/390 light/dark of the dialog, focused tests, lint, typecheck, Convex tests.
Notes `audit/45-notes.md`, `files-45.txt`, no commit. Print **DONE 45**.
