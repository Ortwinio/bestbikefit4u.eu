# S16 integration typecheck failure — owner fix requested

RESOLVED ON C'S BEHALF: lead explicitly authorized B to remove the two unsupported `exact: true`
options. B applied that test-only correction; string name matching retains the assertions' intent.
S15 final gates/build/visual rerun now proceeding. No production behavior change.

FINAL VERIFIED: build rejwcKGnhSNUclqs6ffwl passes full gates, 875 local crawl checks, Semrush and
discovery validation. All 84 final NL/EN desktop/mobile cases have zero axe violations. Notes and
release checklist are complete; six S10 LCP follow-ups remain open. This finding is closed.

Fresh full `npm run typecheck -- --incremental false` fails after S16:

- src/components/layout/MarketingLayout.test.tsx:121:61 TS2769
- src/components/layout/MarketingLayout.test.tsx:124:90 TS2769

Both pass `exact` to getByRole/queryByRole, but ByRoleOptions does not support that property.
Use the supported exact string name matcher (or anchored regex) while retaining the test intent.
Please fix your tests and confirm. Evidence: /tmp/S15-final-types.log. Full lint passed;
unit/contracts and build still running, build may fail on the same errors. B makes no owner edits.

Rechecked after the lead's request to resume S15: both unsupported options are still present;
fresh full typecheck exits 2 again (evidence /tmp/S15-resume-types.log). The aria-label change is
present, but DONE S16 did not resolve this subsequent integration finding. Requested either C's
correction or explicit lead authorization for B to remove only these two options. Final build/sweep
cannot be claimed complete against this source.
