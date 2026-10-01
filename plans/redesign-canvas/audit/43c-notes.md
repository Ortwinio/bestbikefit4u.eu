# 43c — Shared gearing and saddle-width account calculators

## Scope / initial audit

- `src/app/(dashboard)/gearing/GearingCalculatorForm.tsx` and `src/app/(dashboard)/saddle-selector/SaddleSelectorForm.tsx` used separate calculator implementations. Both already had C's 41a autosave integration and backend upserts; preserve those contracts while replacing the duplicate forms.
- The public gearing and saddle-width components each have anonymous-session save effects. Account mode must disable those effects and write only through the authenticated dashboard APIs.
- The lead explicitly approved adding account-mode props and tests to both public form components. Public defaults, interactions and SEO stay unchanged.
- The existing latest-session queries distinguish a selected bike from unbound inputs; preserve that distinction. Loading is not an empty saved state.
- Root owns final checks, fixture integration and this audit. Gearing and saddle implementation work is delegated separately.

## Implementation

- Both account routes now render the actual public form. Optional initial values, change callbacks and header/status slots support account mode without changing anonymous defaults or SEO. Account mode disables anonymous-session writes and uses actual-result wording.
- Gearing selects a bike or unbound calculation. Saved inputs beat bike gearing, then public defaults. Rings/cogs are normalized with min/max rather than array position; a complete saved cassette is retained when its endpoints have not changed. Saved advanced input fields remain intact. The public gearing form has no rider-weight field, so it does not claim a profile measurement was filled or inject new hidden profile weight.
- Saddle width restores saved measurements ahead of profile/bike data and public defaults. Profile-derived fields have a localized provenance link. Unsupported saved measurements receive an explicit warning instead of being silently presented as valid. Historical advanced fields remain stored; the shared basic calculation does not apply hidden advanced adjustments. A saved current-saddle width is used only to refresh its derived match score, without changing the shared recommendation.
- Both editors use 500 ms autosave, commit flushing, retry, retained failure values, and guarded bike switching. User/bike keyed editors freeze initial hydration and do not overwrite active edits on reactive query updates. History remains below the form; mobile result bars clear account navigation. Profile records are never updated.
- The lead approved optional `expectedUserId` guards on both existing dashboard mutations. A mismatch is rejected before database access. The guard is never persisted, and existing callers remain compatible. No schema change. Deploy the guarded backend before the new frontend; preserve C's existing 41a upsert changes in those files.
- D's `/tools/climb-planner` route arrived during integration. The gearing follow-on link uses that account route in account mode; the public link remains unchanged. Both destinations are regression-tested.
- Gearing hydration uses the same field order as shared-form updates, so autosave serialization correctly treats a quick edit-and-undo as unchanged. The new regression failed before this correction and passes after it.

## Validation

- Browser captures: 32 comparisons (two tools × public/account × NL/EN × 1440/390 × light/dark) and 20 persistence scenarios pass. Includes initial-write suppression, saved-value restoration on reload/fresh client, retained failure values/retry and no-bike persistence. Zero overflow, small mobile controls, console/page errors or serious/critical axe findings.
- Actual component screenshots are in `code-renders/43c-*`; raw proof is `audit/43c-browser.json`. The authenticated Convex boundary is mocked; this proves UI restoration, not a live-provider login. Existing backend tests cover ownership and upsert behavior separately.
- Eight mobile account captures preserve the already reported moderate `region` finding on the existing account-header logo, outside 43c ownership. Serious/critical gating matches the project sweep. Desktop dark saddle and mobile light gearing captures were visually reviewed.
- `npm run lint`: PASS (254 contrast pairs and 19 token-only CSS modules).
- Combined frontend, engine and backend suite: **50 tests pass across 12 files**, including prefill precedence, restored values, failed bike switching, anonymous-write suppression, identity guards, unchanged-input suppression and refreshed saddle-match scoring. Both account/public climb-planner link targets also pass their regression assertions.
- `npm run typecheck`: PASS. Earlier refresh attempts were blocked by concurrent `accountState.ts:7` syntax and an unsupported Testing Library `exact` option in `AccountPerformanceCalculator.test.tsx`; both were corrected by their owner, without A editing those files.
- Final isolated production build and filtered sweep: **16/16 cases pass**, zero console/page errors. Snapshot `883bcce555b91e59` includes the account climb-planner destination and unchanged-input fix. Proof: `final-sweep/43c/report.json` and `run-context.json`.

## Changed files

Exact source, test, dictionary and harness list: `files-43c.txt`. Existing shared fixture additions are limited to gearing/saddle persistence, simulated delay/error and restored history; preserve all other owners' fixture work.

No commit or deploy.
