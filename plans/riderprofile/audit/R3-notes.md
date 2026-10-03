# R3 — scores, rings and explanation

Worktree: bestbikefit4u-rider, branch feature/riderprofile. No commit or deploy.

## Delivered

- Pure `scoreRiderProfile({ profile, observations }, nowEpochMs)` and `scoreBike({ bike, observations }, nowEpochMs)` in shared/profileScore. No clock, React, Convex or browser dependency. Both weight sets total 100. Output includes completeness, reliability, level, weighted group contributions, individual factors and the greatest remaining reliability gain.
- B-contract aligned: canonical current fields, observation kind/method/date, current/superseded status and bike scope. Superseded, mismatching-value and other-bike observations do not improve a current value. Bike saddle measurement-point metadata supplements an observation but never turns declared/derived into measured.
- Repeated quality requires an explicit integer repeat count >=3 and within-tolerance evidence. Three history rows are not that evidence. Derived values never become measured. Optional evidence fields support future richer observations without altering B's schema.
- Compound criteria require every constituent; weakest quality/freshness wins. Explicit no discomfort is complete without a pain area. Sensitive complaints never become the suggested next question. Group values are contributions out of the overall 100, not independently normalized percentages.
- Reliability is rounded to one decimal; rings display nearest whole percent. Next-step gain is the theoretical upper bound (weight minus current contribution), not a promise of the gain from one measurement. The explanation makes that distinction explicit.
- Missing/future timestamps are marked missingDate; no guessed age or timestamp is created. Legacy body quality is .85 and other declared rider inputs .6, as disclosed. Bike provenance unknown is .6. Bike derived data uses the general .3 derived factor, not a measured factor.
- ProfileStrengthRings: lg/sm, petrol/lime, visible values and labels, localized levels, two named meters with min/max/current/text values, neutral CSS stroke transition, reduced-motion transition disabled. Zero is a genuinely empty arc. Theme colors use existing tokens only.
- `/nl/profile/score` and `/en/profile/score`: account explainer with all weights, factors, levels, limitations and localized metadata; noindex. Strings live in account/profileScore.ts; frozen dictionaries untouched.
- B has mounted the real component in welcome for rider and optional bike. A did not edit welcome or mount anything in the sidebar. B was asked to link the explanation from the aside.

## Clarification still with lead

PLAN §3 exempts adult dimensions from ageing but does not specify the time/factor for height under 18. Asked lead explicitly; pending reply, implementation/test/copy use the adjacent flexibility policy: strictly older than 12 calendar months ×.8. This is an implementation assumption, not a claim that PLAN specified it. Change that single rule and the matching bilingual explanation/test if lead chooses otherwise.

## Validation

- Focused Vitest: 94 tests passed across 3 files. Each rider/bike weight, every quality factor, warning penalty, strict freshness boundaries and month-end clamping, adult/under-18 height, stale/missing dates, legacy defaults, B's saddle-point evidence, scope filtering, compound rules, levels, gain, meter semantics, localization and metadata are covered.
- Focused TypeScript: `npx tsc --project plans/riderprofile/audit/R3-tsconfig.json` passed. This is supplementary, not a substitute for the whole-repo gate.
- Focused ESLint on all R3 TS/TSX and render harness passed.
- Runtime-boundary, brand-contrast (254/254), CSS-module tokens (0 raw colors) and image-weight checks passed. Tooltip guard currently reports concurrent R1 calculator and R2 welcome registrations, not R3 files.
- Full `npm run typecheck` and `npm run lint` were run; current concurrent calculator work blocks them (missing PersonalizeAdviceBlock/HandoffPrefillNotice, pending ConfiguratorLayout props, calculator hook/import findings). No R3 diagnostic. See final local logs `/tmp/R3-typecheck-final.log` and `/tmp/R3-lint-final.log`; full green remains an integration gate, not claimed here.
- `node plans/riderprofile/audit/R3-render.mjs`: 16 cases passed, NL/EN × 1440/390 × light/dark × rings/explainer. Real components, compiled project Tailwind/CSS Modules and local brand fonts; only Next Link is replaced with an anchor. This is an isolated component render, not an authenticated route E2E.
- Every render asserts no horizontal overflow, no console/page errors, disabled reduced-motion transition. Ring cases also update scores and assert the 450ms normal-motion transition. Machine results: R3-render-results.json. Screenshots: renders/R3-*.png (ignored, not in file manifest). Visually inspected mobile ring gallery, desktop explanation and dark mobile explanation; spacing and text remain readable.
- `git diff --check` passed. No app code outside R3 ownership, shared UI, globals, schema, frozen dictionary, sidebar, production data or fit-engine confidence changes.
