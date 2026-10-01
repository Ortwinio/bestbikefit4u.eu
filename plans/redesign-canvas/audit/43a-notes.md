# 43a — Account calculator infrastructure and fit tools

Codex C. No commit or deployment. Exact manifest: `files-43a.txt`.

## Implementation

- `/tools/saddle-height`, `/tools/frame-size`, `/tools/crank-length` reuse the original public form
  components inside the existing account shell. No duplicate calculator engine or form implementation.
- Public forms accept optional `initialValues` and `onValuesChange`. Their previous defaults, copy,
  metadata, calculations and confirmation/example behavior remain intact. The callback reports edits,
  never initial hydration. Existing public tests pass.
- Saved calculator values take precedence over valid profile values, then public defaults. Profile
  measurements are marked confirmed; untouched defaults remain examples. Flexibility assessment maps
  to the existing 1–5 public score. Values outside a tool's supported domain are not used as prefill.
- The Dutch hint says “Ingevuld vanuit je profiel” and links to “Mijn profiel”. NL/EN account copy lives
  in `src/i18n/account/calculators.ts`; frozen root dictionaries are untouched.
- Initial values are captured after both queries resolve. Later profile/query refreshes cannot replace
  an open editor or trigger a save. Edits persist only calculator state, never profile or archived fits.
- Shared 41a debounce, serial/latest-wins writes, validation, status, retry, and navigation/visibility
  flushing are reused. The three fit tools are rider-scoped (no bike selector needed for these inputs).
- Account result bars sit above the mobile account navigation (76px plus any additional device safe area).
  Public result bars are unchanged.
- `/tools` is registered as a protected application path; new pages have localized titles and noindex.
  Sidebar/quick links remain B's 43d ownership.

## Storage and release

Additive `calculatorStates` table: userId, calculator, optional bikeId, discriminated `state`
(calculator + strictly validated values), updatedAt. Index: user + calculator + bike.
Query and upsert require authentication, and a supplied bike must belong to the caller. They never
accept a userId from the client. The mutation patches the current row; no insert per slider movement.
Runtime domain validation rejects non-finite/out-of-range measurements and invalid assessment scores.
Separate calculators, riders, and bike/unlinked scopes are isolated.

**Deploy Convex before the frontend.** The lead checks the production deployment path; no deploy was
performed here. API declarations include the new functions. Account deletion removes this rider's calculator rows (regression tested). D has included the table
in the bike deletion cascade. C's three initial tools create rider-scoped records only. Lead notified locally.

## Integration contract for D / 43b

Import `useCalculatorAccountState` from `src/components/calculators/useCalculatorAccountState`.
Call `useCalculatorAccountState("<calculator>", { bikeId })`; bikeId is optional. It returns
`ready`, `values`, stable `setValues`, `fromProfile`, and `autosave` (state/error/flush/retry).
Mount the public form only when ready. Initialize it from values and report actual edits to setValues.
Key its editor by authenticated user + calculator + bike, so changing scope mounts a fresh state group.
C's `AccountFitCalculator` shows this pattern for user-scoped tools.

Extend the discriminated validators and calculatorId in `convex/calculatorStates/validators.ts`, then
`calculatorDefaults`, `validCalculatorState`, and profile prefill in `src/lib/calculators/accountState.ts`.
Do not use an unvalidated `v.any()` payload. Add the performance tools' real engine input domains,
profile mass/FTP mapping, and tests. The query/mutation/hook themselves are reusable unchanged.
`useCalculatorValuesChange` provides a hydration-safe optional output callback for existing forms.

## Verification

- **33 focused tests pass**, including the existing public page/form suites. Precedence for all three
  tools, loading, invalid profile fallback, profile refresh isolation, failed retry and restored edits.
- Account crank copy and `/fit` CTA are regression tested; public intro/signup CTA are unchanged.
- Convex tests cover authenticated upsert, rider/bike/tool isolation, foreign-bike read/write rejection,
  post-login restoration, domain validation, and removal of only this rider's records on account deletion.
- **24/24 final public/account comparison cases pass**: three tools × two modes × two widths × two
  themes. Account cases change an actual slider, await save, and restore it in a fresh page.
- **36/36 combined filtered sweep cases pass** in `final-sweep/41a-43a`, including all three new account
  routes in NL/EN at 1440/390. Axe, mobile 44px targets, locale, images and overflow pass.
- Explicit mobile geometry assertion confirms the sticky result bar sits above account navigation.
  Its offset includes device safe areas. Visual review covered desktop frame-size, dark mobile
  saddle-height, and final mobile crank intro/result/CTA. Screenshots are ignored, never in manifests.
- C's owned-file and harness ESLint pass. The isolated final source passes TypeScript and a complete
  production build. Earlier full-tree lint passed all 254 contrast checks and the CSS token guard.
- The harness eagerly decodes lazy images before checking them, matching the main sweep behavior.
  No Header/Footer changes were made.

### Scope of browser proof and current shared-tree gates

The harness uses actual components and production CSS with deterministic Convex/auth fixtures. It is
not a live production login test; authentication/ownership and persistence are covered by backend tests.
No user records were created or changed during QA.

Full-tree lint/typecheck passed earlier in the task. The last shared-tree rerun after B/D edits had:

- a `BikeWheelsetEditor.tsx` Select callback ID/string type mismatch;
- stale `.next/dev/types` versus `.next/types` layout routes after parallel `/app` changes;
- a missing tooltip-guard exemption for the new `BikeWheelsetEditor.tsx`.

These were reported to the lead/owner. Earlier profile and bike syntax errors were fixed by their owners.
C did not edit those sources or suppress any checks. Integration must rerun the full-tree gates after
parallel work settles.

For final C verification, `/tmp/bbf43a-final-stable` uses the passing production source snapshot
`143ae4d4255e3cf1`, overlaid with C's current `src/` and `convex/` files from `files-43a.txt`.
Visual tooling is refreshed from the working tree. This excludes newer unfinished B/D edits.
Command: `node tests/visual/calculator-account/capture.mjs --root=/tmp/bbf43a-final-stable`.
Final fingerprint: `a637d316195539d1477de698823565e98e76f525756f5727162a44a2e4f8e3b3`.
Build ID: `0dWPHQWTt705BReN84MBB`. JSON: `audit/43a-browser.json`.
This proves C's final changes against a passing baseline; it does not claim the entire concurrent
working tree is release-ready. Normal harness runs without `--root` use the current working tree.

DONE 43a. No commit, push or deployment. **Deploy Convex before the frontend.**
