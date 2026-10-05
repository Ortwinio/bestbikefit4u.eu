# F2 account recovery and completion

Worktree: `/Users/ortwinverreck/Developer/bikefitboost-reliability`; branch: `feature/reliability-full`.

## Delivered

- Account saddle-height and knee-angle routes use the shared calculator template and C's shared models/backend contract. No shared template, model, or backend edits in this recovery.
- Complete account controls: bike selection, inseam measurement/history/mean, bike type, riding goal, flexibility, core stability, climbing, current saddle height, and measured knee angle. Height is reused from the profile for plausibility; missing profile data links to the profile editor.
- Profile/preferences populate controls without writes. Preferences save only touched fields; measurements require explicit submission. Measurement request IDs survive retries and reset after success. No sample measurements/default preferences are saved on mount.
- Provenance and measurement dates remain visible. Flex/core are self-assessments, not measured evidence. Unresolved measurements retain warning/dashed ranges. The knee teaser requires three consistent measurements without an unresolved warning and an explicit bike type/goal.
- Knee access follows server `canUseKneeAngle` (existing paid enforcement). Denied access hides both mutation controls and saved results; missing model data hides the measurement form. Saved knee results use their recorded inseam/provenance, not the current profile.
- Shared knee model supplies the 25–35 degree verdict, uncertainty, and maximum 5 mm adjustment step; the UI includes seven-day evaluation, email preference copy, pain warning, and honest manual-photo instructions.
- Recovered two issues: untouched knee-height prefill now follows profile updates while retaining deliberate edits; edited values no longer claim profile provenance. Query failures now use separate NL/EN loading-error copy instead of claiming a failed save and preserved input.
- All five account files containing Input/Select controls already have tooltip guard entries. No guard edit needed; existing parent-owned registrations remain intact.

## Verification

Commands run with `/bin/sh`, `login:false`, `/opt/homebrew/bin/node`, and the worktree as cwd.

- Focused Vitest: `src/components/reliability/account` and `src/i18n/account/reliability.test.ts`: **6 files, 56 tests passed**. Recovery baseline was 54 tests; two locale-specific prefill regressions added. Existing query-error tests now assert the correct message.
- ESLint: account component directory, both routes, and account reliability dictionary/test: **passed**.
- Tooltip guard: **passed**, 67 form-control files verified.
- Full application TypeScript (`tsc --noEmit --incremental false`): **passed**.
- The previously reported combined 415-test run was not rerun by this recovery worker.

## Handoff to A

### Screenshot follow-up: flattened account cards

- Both account views now pass `steps=[]`, their own cards via `inputContent`, and `unframedResults` to the parent-owned template. Duplicate template headings, nested card frames, and repeated assessment/instruction omitted panels are removed.
- Saddle keeps three input cards (measurements, bike/goal, assessments), with the saved settings date or explicit unknown date inside the bike/goal card. Knee keeps its photo, instructions, and angle form cards. Advice, knee teaser, verdict, adjustment plan, safety copy, and the single next step remain intact.
- Flex/core retain 1–5 numeric inputs: unknown values remain blank, with no slider midpoint or other invented default. Persistence and access gating are unchanged.
- Added NL/EN composition regressions checking unique headings, card counts, absence of template card wrappers/nesting, unframed results, settings dates, and blank unknown scores. Focused suite now **6 files, 62 tests passed**; scoped ESLint, full TypeScript, and scoped diff check passed for this follow-up.
- Follow-up files: `AccountSaddleView.tsx`, `AccountKneeView.tsx`, `SaddleSettings.tsx`, `AccountViews.test.tsx` under `src/components/reliability/account/`, and this audit. The existing 25-file manifest still covers every deliverable. Parent owns the requested 96-fixture screenshot recapture; visual approval is pending that run.

Pure fixtures and views remain available as documented in `plans/reliability/messages/F2-account-to-A-fixtures.md`: AccountSaddleView, AccountKneeView, accountSaddleFixture, and kneeResultFixture. A owns browser/axe/reduced-motion QA in NL/EN at 1440/390, including insufficient/spread-warning/locked/missing-data states. Those browser gates are not claimed here.

Exact repository-relative deliverable paths, including this audit and manifest, are in `files-F2-account.txt`. No commits, deployments, environment changes, production access, or mail sends.
