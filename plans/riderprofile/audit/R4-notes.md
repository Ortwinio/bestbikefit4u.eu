# R4 — calculator chain

Implemented in the rider worktree, without commits, deployment or database writes.

## Behavior
- All calculation forms use live owned rider/bike values ahead of saved calculator snapshots. Stored scenario preferences remain useful; reactive reads never trigger autosaves.
- Shared context shows the actual used fields, matching evidence kind/date, missing inputs and why they help. A’s advice reliability uses the same inputs. Unknown evidence stays unknown; estimates never become measured automatically.
- Editing a profile/bike input requires an explicit save or calculation-only choice. Failed or conflicting saves retain the draft. Switching bike resets local deviations. Measured saddle height requires its reference point.
- Atomic backend saves validate bounds, scope, expected current values and bike ownership before writes. Tire edits affect the actual active tire setup. Existing bike type/goal side effects remain intact.
- Fit creation freezes used profile values and observation evidence. Explicit trials have their own snapshot without borrowed measurement IDs. New generation no longer overlays old calculator inputs. Previously published legacy reports retain their historical rendering.
- A single next-calculator recommendation follows PLAN §6; reported discomfort takes priority. Only route/bike IDs appear in links, never measurements.
- Dutch/English copy lives in the owner dictionary. Static shoe/cleat guidance has no calculator inputs to hydrate and remains guidance.

## Validation
- Combined focused suite: 307 passed, 20 existing opt-in browser-contrast tests skipped (45 files passed, one skipped). Additional session/communication/backend review run: 68 passed.
- `npm run typecheck` passes. Full `npm run lint` passes, including tooltip, contrast, CSS and image checks.
- `node plans/riderprofile/audit/R4-capture.mjs`: NL/EN at 1440 and 390, each baseline/pending/trial/saved. No runtime errors or horizontal overflow; no write before explicit save. RP6 comparison images load successfully.
- Desktop pending and mobile baseline inspected, then contradictory legacy public confidence badges and competing next-step CTAs removed in account mode. The final harness re-renders those fixes.
- Capture uses actual account saddle form, chain, layout, styles and fonts with deterministic auth/router/backend boundaries; dashboard shell is outside this fixture. Existing calculator visual language and numeric engines are retained.
- Added regression checks for bike-switch save races, method edits during save, exact active-tire identity, explicit FTP method, localized enums and trial-session handoff.

## Limits
The next-step summary uses conservative profile/bike timestamp staleness. R9’s persisted dependency-backed advice query remains authoritative for the advice tab.
The fuel engine consumes sweat/ride-scenario inputs, not FTP/weight; unused fields are not falsely advertised as engine inputs.
Real authenticated persistence is covered by mutation contracts and component mocks; no production data is accessed.

See files-R4.txt for exact source/test ownership; shared schema/API/README changes are narrow and preserve parallel work. Screenshots are local review artifacts only.
