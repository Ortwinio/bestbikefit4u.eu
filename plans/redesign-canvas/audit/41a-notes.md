# 41a — Shared autosave and account tools

Codex C. No commit or deployment. Exact files: `files-41a.txt`.
The pressure calculator belongs to A/task 42, as confirmed by the lead; no pressure page or
shared PressureCalculatorForm edits in 41a. Queued follow-up 43a starts after this handoff.

## Initial page audit

Locations refer to the pre-change source inspected at task start.

| File / original location | Existing interaction | Change |
| --- | --- | --- |
| `gearing/GearingCalculatorForm.tsx:355–402` | Effect inserted a gearingSessions row on every valid change; saved values never loaded; query refresh could overwrite edits | Debounced serial autosave, current row per user+bike, saved-first hydration |
| `gearing/GearingCalculatorForm.tsx:695` | Ad hoc saving/retry state | Shared polite status/retry |
| `settings/page.tsx:146,268` | Display-name save button | Always editable, 800ms typing debounce and blur flush |
| `settings/page.tsx:390` | Units mutation, toast-only failure | Optimistic local field value, queued autosave and inline retry |
| `ThemeProvider.tsx:100–110` | Immediate theme mutation and server preference effect could revert an edit | Queued autosave; hydrate once per user; settings status |
| `saddle-selector/SaddleSelectorForm.tsx:315,641` | Explicit “Save this recommendation”; inserts per save; saved calculator values not loaded | Shared autosave, current row update, saved-first hydration |
| `shoe-cleat-fit/page.tsx` | Guidance and start-fit link, no editable values | Audited; explicit start-fit decision retained |
| `feedback/FeedbackAccountPage.tsx:102` | Explicit vote/submit actions; no simple editable saved-value block | Audited; submit/vote actions retained |

Paths in the table are under `src/app/(dashboard)` except ThemeProvider under
`src/components/providers`. Report generation, delete, import, Strava connection, photo upload,
language navigation and multi-step fit actions remain explicit decisions.

## Shared API

See `41a-primitives.md`: `useAutosave`, `AutosaveStatus`, `AutosaveField` exported by
`@/components/ui`. Copy lives in `src/i18n/account/autosave.ts`.

- Debounce (800ms text, 500ms slider groups), blur and pointer/key/click commit.
- One request in flight per group; intermediate edits coalesce and the latest valid value wins.
- No initial/hydration write and no duplicate unchanged write. Key editors by bike identity.
- Validation blocks writes and gives a localized inline message. Server validation stays in place.
- Failed values stay editable; retry sends those values. No silent server-query reversion.
- Polite live status; saved clears after two seconds. Recalculated advice reports “Je advies is bijgewerkt”.
- Visibility/pagehide/unmount flush pending work; SPA unmount drains queued writes. Hard browser
  termination cannot guarantee delivery of a network request; a completed save is announced only
  after the server promise succeeds. This is not an offline synchronization system.

Theme and unit/name editors use the same behavior. The tooltip coverage list includes the name/units
component extracted from the already-exempt settings page; no measurement tooltip enforcement was removed.

## Persistence and ownership

The existing dashboard gearing mutation now upserts the latest dashboard row for the authenticated
user and exact bike (including the distinct unlinked setup). The matching query has the same scope.
Both require authentication; bike-specific reads/writes require bike ownership. Results are
recomputed with the gearing engine on the server. Invalid circumference/duration/gear data are rejected.
The UI restores saved inputs before bike/profile defaults and does not write changes back to the profile.

Saddle-selector uses its existing authenticated mutation/query with the same current-row behavior;
existing input validation and ownership are retained. Archived fit sessions are never touched.
Old duplicate calculator rows are left intact; no destructive migration or history purge.

Three optional fields were necessary in the existing gearing input schema to round-trip visible inputs:
`groupsetName`, `comparisonCassetteTeeth`, `climbDurationMinutes`. The lead was told before this additive
change. Existing rows remain valid. **Deploy Convex before the frontend**, so the backend validators
accept these fields. No Convex deploy was performed here.

## Toast localization (lead addition)

Shared Toast viewport now says `Meldingen` on Dutch routes and `Notifications` on English routes.
The close button also uses Dutch `Melding sluiten`; English `Dismiss notification` is unchanged.
Copy is in `src/i18n/account/sharedUi.ts`, with locale regression tests. Root NL/EN dictionaries untouched.

## Validation

- 40 focused tests pass: fake-timer debounce, latest-wins/serialization, failed retry, newer edit after
  older failure, unchanged/hydration suppression, validation, visibility/unmount flush, release/typing
  behavior, NL/EN status and toast labels, server upsert/ownership/validation, page reload precedence,
  retained error values, and theme persistence.
- `npm run typecheck`: passed.
- `npm run lint`: passed, including runtime boundaries, tooltips, 254 contrast checks and CSS tokens.
- `git diff --check`: passed.
- Isolated production build/TypeScript: passed during visual verification.
- Browser harness: actual page components + production styles; Convex/auth are deterministic fixtures.
  It captures saving, saved and error at NL1440/390 light/dark, checks axe/44px/overflow, exercises retry,
  and verifies a saved gearing/saddle value after reload. Backend ownership is covered by Convex tests,
  not by these fixture pages.

Evidence: `41a-browser.json`, `code-renders/41a-autosave/` (ignored screenshots), and filtered sweep
`final-sweep/41a-43a/`. The earlier `final-sweep/41a/` run is superseded. No PNG files in the manifest.


### Final evidence

- Actual-component autosave harness: **24 cases, 0 failures**; saving/saved/error screenshots for all
  three edited pages at NL1440/390, light/dark. Gearing and saddle values survive reload; retry exercised.
- Combined filtered sweep: **36/36 cases pass** across 9 routes (NL/EN, 1440/390), including all 41a
  routes and the three 43a additions. Axe, mobile 44px targets, locale, images and overflow pass.
- Visual review: mobile dark settings error/retry and gearing, plus saved/saving captures; no overlap
  or unintended field reset. Full lint and typecheck pass after the parallel bike work settled.
- During verification, a concurrent-build timeout caused four gearing test failures; the isolated
  gearing rerun passed 8/8, then the complete focused rerun passed 40/40. No timeout increase added.
- Shared visual fixture runtimes gained a skipped-query pagination adapter for D's new bike deletion
  component. Unsupported non-skipped queries still require an explicit fixture.

DONE 41a. No commit, push or deployment. Pressure calculator remains A's task 42.
