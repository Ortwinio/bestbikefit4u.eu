# R2 — backend, login, welcome and FTP

Worktree `/Users/ortwinverreck/Developer/bestbikefit4u-rider`, branch `feature/riderprofile`.
README/PLAN and RP2/RP3 read. B-contract.md was the first written artifact, then aligned with
C's exact HandoffEntry shape. No commit/deploy, production writes, real mail or new dependencies.

## Implementation

- Authenticated `profiles.mutations.importHandoff`: known fields/units/calculators, finite values,
  timestamps, unique fields and shared profile/bike limits. Conflicts return before any write,
  including bike creation. Explicit choices carry expectedCurrentValue; concurrent changes return
  fresh conflicts. Current values are never silently overwritten.
- `profileObservations`: user/field index; current/superseded history; kind, method, unit, date,
  source public_handoff, optional bikeId. Identical rider confirmations do not duplicate observations.
  `profiles.queries.getHandoffContext` returns the current user's profile and current rider observations.
- Optional FTP/date/protocol, EU shoe size, cleat system and sweat profile. Goal reuses positionPriority.
  New FTP without an explicit protocol does not inherit an old test protocol.
- Partial profiles retain only confirmed values. Previously mandatory body/assessment fields are
  optional; no invented measurements. Shared readiness guards block incomplete fit/session generation.
  Profile/wizard/admin handling preserves known inseam and displays missing data honestly.
- Bike creation uses the existing createBikeWithProfiles helper. Chosen name/type, saddle/crank and
  explicit saddle measure point/date/source persist. Other bike inputs remain bike-scoped observations
  for the later model expansion, not fabricated setup/geometry or automatically measured provenance.
- Login handoff panel reads real session data and localized provenance. All auth redirects use
  localized /welcome in handoff mode; regular login remains unchanged. No import/clear at login.
- Welcome supports keep/adjust/omit, explicit bike selection/name/measure point, conflicts and
  profile/today/remeasure choices. A's real scores preview only accepted values. Default flexibility
  is not saved without explicit confirmation. Successful confirm and cancel clear bbf.handoff;
  errors/conflicts retain it. Re-measure keeps the existing profile value.
- Account performance/gearing FTP prefill shows its date, preserves saved calculator state and edits,
  and never writes defaults as profile facts. Existing calculator 80–500 W limits remain: unsupported
  profile FTP is not silently clamped. Full live calculator chaining is R4, not this task.

## Design / privacy

NL/EN account dictionaries; no frozen messages changed. No Ontwerpstaat or hardcoded rider/bike
examples in product code. Measurements never enter handoff URLs, auth args, analytics or production
logs/new email flows. Backend errors do not echo submitted values.

Real auth behavior is preserved where the sketch differs: seven-character code rather than the
six-digit example, and no unsupported newsletter-default promise. Bike creation defaults off until
explicitly selected and named. The RP3 two-profile summary is coordinated with A; rider reliability
is never mislabeled as bike completeness.

Renders: real React components, repository CSS/tokens, local brand fonts, fake auth/data; no live
backend or transport. `renders/R2-login-*`: 12 NL/EN × email/code/empty × 1440/390 screenshots.
Welcome: 12 new/conflict/empty × NL/EN × 1440/390. FTP: 8; partial profile: 4.
Harnesses check browser errors/overflow. RP2 desktop/mobile and RP3 desktop/mobile visually inspected.

## Checks / integration status

- All Convex: **73 files / 505 tests pass**.
- Core focused: **7 files / 124 tests pass** (profiles, sessions, login, welcome).
- Partial-profile sidecar: 65 focused tests; FTP sidecar: 47 isolated tests. Counts overlap.
- Parent-owned backend/login scoped ESLint passes; welcome scoped lint/CSS tokens pass.
- Real public saddle-height → login → authenticated import test is written in
  `src/app/welcome/handoff-flow.test.tsx`, asserting inseam + public_handoff provenance and value-free
  URL. It cannot yet load C's pending PersonalizeAdviceBlock/HandoffPrefillNotice imports.
- Full typecheck/lint attempted; currently blocked by C's missing components, ConfiguratorLayout
  notice props, callback/effect findings and shared tooltip registration for the new forms.
  Coordination messages sent; B does not overwrite C's files or hide these failures with mocks.
- Lead explicitly accepted this R2-owned handoff while C finishes R0 then R1. The lead will run
  the combined full gates and real public-handoff acceptance after R1. These remain pending,
  not passing. Latest attempted logs: /tmp/R2-typecheck-handoff.log and /tmp/R2-lint-handoff.log.
- Lead approved partial profiles: keep supplied values, no invented defaults, guard calculations.
- R2-owned work complete; continuing to R5 at the lead's instruction. No C-owned components edited.

Detail: R2-partial-notes.md, R2-ftp-notes.md, R2-welcome.md. Exact ownership: files-R2.txt.

## Supplemental R1 integration gate — 3 October 2026

With R1 landed, the real public saddle-height handoff test reached LoginPage and exposed a
test-harness-only missing theme context in BrandLogo. Added the same light-theme `useTheme`
mock used by the existing login tests, solely in `src/app/welcome/handoff-flow.test.tsx`.
No calculator, app, C-owned file, slider accessible name, or acceptance assertion changed.

```sh
npm test -- src/app/welcome/handoff-flow.test.tsx src/app/welcome/WelcomeClient.test.tsx 'src/app/(auth)/login/page.test.tsx'
npx eslint src/app/welcome/handoff-flow.test.tsx
```

Result: **3 suites / 49 tests pass**; targeted ESLint passes. This supersedes the earlier
pending public-handoff acceptance gate. The flow test uses the actual public calculator and
session store, real LoginPage and localized `/en/welcome` redirect, then the real import mutation
against a fake database, verifying only the touched inseam is saved with `public_handoff`
measured provenance and no measurement values enter the URL. The companion WelcomeClient suite
verifies confirmation, conflict choices, and session clearing.

`files-R2.txt` already includes `src/app/welcome/handoff-flow.test.tsx`; no source-manifest change
was necessary. Only that test and this supplemental note were edited. No commit/deploy.
