# R10 — bike profile

Implemented in the rider worktree. No commit, deploy, migration or production write.

## Scope and behavior
- RP8 bike profile mounted on the existing owner-authenticated detail page; existing photo, passport, fit history, wheel/pressure and editing tools remain in an expandable section.
- Shared scoreBike completeness/reliability, seven group bars, missing-data actions, typed NL/EN owner dictionaries.
- Per-field reference point, date and source. New measurements are explicit; untouched defaults are not saved.
- Optional saddle/contact-point fields, spacers and manufacturer adjustment limits; riding goal remains per bike.
- Geometry lookup connects an actual validated database record and fills its geometry with database provenance.
- Maximum exposed seatpost length uses a different reference from saddle height. Missing current extension therefore remains unknown, never an unsupported claim that a target fits.

## Validation
- Affected bike frontend suite: 89 tests pass across 22 files, including NL/EN detail-page integration and explicit measured saves/conflicts.
- RP8 browser harness: four NL/EN × 1440/390 contexts, baseline/editing/saved plus side-by-side board comparisons. No runtime errors or overflow. Untouched fields produce no write; save carries the original expected value, chosen kind, date and fixed reference. Saved measurement increases the computed score.
- Form/garage harness: 12 NL/EN desktop/mobile contexts. Verified no hydration writes, explicit saddle-model save/clear and visible real geometry-library selector. Final captures include field-help controls.
- Desktop profile and mobile saved state inspected. Fixed tiny ring display, an undefined color token, year grouping, long cassette display, missing reference labels and missing edit links during review.
- Backend regression: 128 tests pass across 14 files (bikes, calculator chain, fit sessions, pressure and gearing). Final `npm run typecheck` and `npm run lint` pass, including all tooltip/contrast/CSS/image checks. `git diff --check` passes on R10-owned files.

## Review artifacts
`R10-capture.mjs` uses the actual RP8 component, shared score engine, tokens and fonts with synthetic backend/router boundaries. No live customer data or production persistence.
Screenshots are ignored local review artifacts and will not be listed in files-R10.txt.

## Integration choices
- Shared A-owned ring component is reused in its existing dark style inside the white RP8 score hero. Seven group bars, lime gain card, setup rows and side panels follow the board. No example names, values or review strip are hardcoded in product code.
- Component labels entered without an explicit measurement remain declared. Database geometry has database source only for trusted actual records; it is never represented as a personal measurement.
- Existing missing-bike null response now renders the existing not-found state instead of remaining on a loading screen.
- Forms use explicit clearFields for unknown/removed values, so clearing and omission are distinct. Unchanged metadata is retained; changed values retire old evidence.
- The advice navigation destination now uses B’s completed R8 route `/profile/advice`.
- Passport copies discard prior-owner measurement metadata. Missing/superseded geometry links are cleared only for copied bikes while preserving copied dimensions conservatively; explicit inactive library selection still rejects. Import provenance has localized source labels, covered in both languages.
