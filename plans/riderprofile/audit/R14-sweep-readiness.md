# R14 account sweep readiness

Updated the final-sweep harness only. No production source files changed.

## Coverage added

- `/welcome` uses the actual standalone welcome page, with authenticated deterministic context and
  no manufactured browser handoff. This baseline therefore covers the empty-handoff state; populated,
  conflicting and imported handoffs remain covered by R2's dedicated tests/renders, not this sweep.
- `/profile/score` renders the actual bilingual explainer under the account shell.
- `/profile/advice` renders B's actual R8 server page/client under the account shell, with the explicit
  empty-outcome fixture. Added after checkpoint/rebase `169f7fc`; rich R8 states remain dedicated coverage.
- The existing four account bundles receive an in-memory query adapter for rider provenance,
  handoff context, reserved prompt cards, advice groups and calculator-chain context.
- Provenance contains three explicitly measured fixture observations matching the fixture profile.
  Unavailable fields stay unavailable. Existing batch values are not replaced with a complete profile.
- Prompt data follows the reserved-card contract and includes an unanswered measurement; no mount
  mutation needs fabricated success. The sweep does not certify answers, persistence or prompt limits.
- Advice is explicitly seven empty groups; this adapter does not manufacture results from saved inputs.
  Filled/stale/recalculated advice needs B's R8 dedicated captures; empty advice is not full R8 coverage.
- Calculator-chain context includes the actual fixture's selected bike and profile. It has no active
  wheelset/tire or recent outcome; these gaps are intentional, not hidden defaults. Unknown bike IDs throw.
- Unknown query names still reach the existing error/unknown-query collector. No catch-all null/empty
  response was introduced. `skip`, loading and missing-profile states remain distinct.
- Source routes are tested in NL/EN at 1440/390 by the existing sweep matrix. No metadata, auth or
  backend writes are certified by account fixture HTTP responses.

## Checks performed

`node --test tests/visual/final-sweep/routes.test.mjs tests/visual/final-sweep/rider-fixtures.test.mjs`

13 focused route/runtime/production-input tests pass after the rebased follow-up. All four account fixture bundles compile in a local-only smoke check with synthetic CSS;
this compilation check is not a visual render or a production-style check. No large sweep was launched.

Root launched the large sweep after rebase. Its first isolated build exposed missing script imports from
new main source tests (`scripts/lib/html.mjs`, `scripts/import-guide-rewrites.mjs`). Added their paths to
the shared copying/fingerprint input list; regression tests verify both copying and cache invalidation.
Root controls the full rerun; this tooling change does not mask any app build error.

Runtime-only smoke checks found two outdated fixture contracts: newsletter preferences on `/profile`,
and R10 score/observations/adjustment-room fields on bike detail. Added explicit opted-out newsletter data
and the actual `scoreBike()` result from fixture values, with unknown adjustment room and no fabricated
measurement observations. The rerun has zero page errors/unknown queries on NL+EN profile, bike detail,
manual bike creation, pressure calculator and FTP tool. Prior smoke also covers dashboard, score, advice,
welcome, bike-fit tool, gearing and bike list. Synthetic CSS means these are not visual/axe acceptance.

## Integration commands (root controls timing)

First confirm the coordinated checkpoint/rebase and the current source build, then:

```sh
node tests/visual/final-sweep/sweep.mjs --filter=/welcome,/profile,/dashboard,/tools,/pressure-calculator,/gearing,/saddle-selector --output=plans/riderprofile/renders/R14-account-smoke
node tests/visual/final-sweep/sweep.mjs --output=plans/riderprofile/renders/R14-final-sweep
```

The full runner uses axe unless explicitly disabled; do not use `--without-axe` for acceptance.
It builds an isolated production snapshot and reports remaining unknown queries instead of hiding them.
Existing locale-specific SEO redirect expectations may need reconciliation after the main rebase;
this rider-only patch does not pre-emptively alter those unrelated expectations.

## Completed sweep triage and corrected harness

Root completed all 320 cases. Two genuine source-owned issues remain: Dutch advice filter `Rider`
(B) and five 25.5px-wide English mobile bike-profile edit links (C). Exact selectors and owner paths
are in `messages/A-R14-to-B-C-sweep-findings.md`; these are not suppressed.

Harness corrections after observing actual results:
- Main intentionally redirects wrong-locale bikefitting routes with 308; expectations now assert
  the correct localized destinations, with tests.
- Language detection recognizes only exact `Free en Pro`/`Free als Pro` references and standalone
  `Free` in pricing headings/table headers. Generic English `free` remains detected.
- Three exact original publication titles are retained in citations; surrounding English remains checked.
- Native validation is identified only through `validity.customError === false`. Its complete text,
  selector and pathname are retained in `checks.language.environmentDiagnostics`. Custom/unknown
  validation messages remain checked. The strict NL collector also preserves raw chunks.
- The deterministic fixture bike name is localized in-memory to `Duurracefiets` in NL; no real
  user-generated data or app wording is changed.

20 focused checks/language/routes/rider-fixture tests pass; ESLint passes for changed language checks.
Root can run the full corrected sweep with six workers, reusing the isolated source build where valid.

## Exact changed files

tests/visual/final-sweep/account-fixture.mjs
tests/visual/final-sweep/account-fixture-bikes-runtime.jsx
tests/visual/final-sweep/production.mjs
tests/visual/final-sweep/production.test.mjs
tests/visual/final-sweep/rider-fixtures.mjs
tests/visual/final-sweep/rider-fixtures.test.mjs
tests/visual/final-sweep/routes.mjs
tests/visual/final-sweep/routes.test.mjs
plans/riderprofile/audit/R14-sweep-readiness.md
tests/visual/final-sweep/checks.mjs
tests/visual/final-sweep/nl-language.mjs
tests/visual/final-sweep/nl-language.test.mjs
tests/visual/final-sweep/nl-sweep.mjs
tests/visual/final-sweep/nl-reanalyze.mjs
plans/riderprofile/messages/A-R14-to-B-C-sweep-findings.md
