# R6 — rings in account surfaces

Worktree bestbikefit4u-rider only, no commit/deploy. Three disjoint A subagents handled shell,
advice scoring/component, and render evidence; A owned dashboard hero and final review/gates.

- Desktop sidebar and mobile header mount live `AccountProfileStrength`, with localized /profile links.
  Both use B's getMyProvenance query, including conservative legacy evidence, not guessed measured values.
  Loading displays text, not a false zero. A genuinely empty profile displays zero after the query returns.
- DashboardProfileStrength provides the large RP4 ring hero, level ladder, explanation link and the
  next-step upper-bound gain. B mounted it above DashboardProfilePrompts; B retains dashboard route ownership.
  Existing body/comfort/report scores remain unchanged. No hardcoded rider identity or score.
- AdviceReliability + scoreAdviceReliability are ready for C's R4 account-calculator mounts. Selected
  input fields only, normalized weights; missing selected inputs remain in the denominator. Compound
  weights are divided equally across their explicitly selected fields. Unknown fields throw rather than
  silently disappear. This measures input quality, not clinical certainty or the fit engine's confidence.
- R5 compatibility: structural observation-array equality and documented legacy geometry/import evidence.
  Bike observations stay scoped to their bike; derived evidence never becomes measured. No schema change.
- Meters retain visible text, names and aria-valuetext. Small mobile rings use a compact variant; all motion
  honours reduced-motion. Tokens only; new copy in account dictionaries, frozen dictionaries untouched.

## Evidence

- Focused Vitest: 131 tests pass across 8 files (scorer, selected-input helper, rings, shell, dashboard hero,
  advice meter, sidebar and layout). Existing jsdom navigation warning is non-failing.
- Full npm run lint passes: ESLint, runtime boundary, tooltip registration, 254 contrast pairs, CSS tokens
  (zero raw colors) and image weight.
- Full npm run typecheck passes on final rerun. C resolved its transient handoff-test diagnostic.
  Final log: /tmp/R6-typecheck-final.log.
- R6-render.mjs captures actual components and dashboard mount using mock auth/Convex only: NL/EN,
  1440/390, light/dark, filled/empty/loading dashboard plus filled/empty advice slot. 40 cases, no overflow,
  runtime or console errors; named text-valued meters and localized profile links asserted.
  R6-render-results.json confirms the real dashboard mount in all 40 cases. Screenshots in renders/R6-*.
- Root inspected the real NL mobile and EN dark desktop dashboard screenshots. Advice meter renders are
  an isolated slot inside the real account shell; C owns its calculator placement in R4.
- R3's unspecified under-18 freshness threshold remains the documented 12-month assumption pending lead
  clarification; no new freshness policy introduced here. No analytics or measurement logging added.
