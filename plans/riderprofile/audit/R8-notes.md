# R8 — My advice

Implemented `/profile/advice` using A's real seven-group advice query and recalculation contract.
Profile navigation now exposes data/advice/bikes tabs. NL/EN copy is in account dictionaries;
the private route has a clean localized canonical, noindex/nofollow and no language alternates.

## Behaviour

- Authenticated queries only, separate loading/empty/error states, real bike/rider filtering.
- Actual targets/ranges/current/differences, mono numbers and units; literal frame strings preserved.
- Per-result confidence and reason, never invented group confidence or profile-score substitution.
- Unknown provenance is not fresh; saved-input dates are labeled saved rather than calculated.
- At most three positive finite theoretical profile improvements per group, not promised advice gains.
- Global recalculation scope is explicit. Mixed result counts and localized reasons are preserved.
  Pending or failed jobs never optimistically change existing advice, report links or freshness.
  Reactive query data alone supplies replacement results; the started count is a historical summary.
- Optional interest records contain only allowlisted calculator keys, never measurements or identifiers.
- No example records, review strip, fake performed/waiting states or invented paid-plan promise.

## Validation

- Route/metadata/tabs: 56 tests pass. Final combined view/profile/prompt regression run:
  139 tests pass across seven files, including UTC-date and safe dictionary-key regressions.
- Advice backend/shared and demographic helper/contract suites: 140 tests pass across six files.
- Full typecheck passes. Full lint passes ESLint and runtime boundaries, then stops on C-owned
  `src/components/bikes/BikeForm.tsx` Input #3 missing tooltip. No B-owned lint error.
  Remaining stages run separately: contrast 254/254, CSS modules 27/27 token-only, images pass.
- 32 offline real-source captures: NL/EN, 1440/390, stale, recalculated, pending, mixed outcomes,
  error, empty, filters and dark. No horizontal overflow, runtime errors or external requests.
  Parent inspected NL desktop/mobile and EN dark desktop. Harness fixtures are not live data.
  Evidence: R8-advice-notes.md and ../renders/R8-advice-results.json.
- Independent review: R8-independent-review.md; component and route proofs: R8-ui-notes.md,
  R8-tests-notes.md. No live auth/backend, production calls, commits or deployments.

## Owner handoff / honest limitations

A owns engine grouping and source links. Bike-fit output grouping and loss of selected-bike scope
on generic calculator links are reported in messages/B-to-A-R9-grouping-observation.md and
messages/B-to-A-R8-integration-review.md. B does not duplicate backend grouping or invent URL args.
PLAN performed/waiting-for-ride and board mark-done require a persisted contract not supplied by R9;
they are intentionally not simulated. Per-job background progress also needs a persisted query.

R13 follow-up: A found no validated demographic estimate. Optional-field reasons now explicitly
say FTP/flexibility estimates are not currently made. No estimated values or placeholders appear.
Lead should decide whether to proactively ask these optional fields before a supported use exists;
the authorized prompt policy remains unchanged. See the supplement in R13-notes.md.

R11 shared logout integration remains requested from its owners in B-to-A-C-R11-logout.md;
the conservative consent flow never silently transfers consent to another account.
