# Output 05 — Final Audit

## Findings

### Medium

- The implementation is split across two backend contracts, which increases drift risk and makes the chosen `bikeImports` preview contract non-canonical in practice. The UI calls the legacy preview path in [MarktplaatsBikeImportFlow.tsx:59](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/MarktplaatsBikeImportFlow.tsx#L59) while save goes through the newer `bikeImports` action in [MarktplaatsBikeImportFlow.tsx:60](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/MarktplaatsBikeImportFlow.tsx#L60). That preview path is implemented in [actions.ts:42](/Users/ortwinverreck/Developer/bestbikefit4u/convex/marktplaats/actions.ts#L42) and persists via [mutations.ts:12](/Users/ortwinverreck/Developer/bestbikefit4u/convex/marktplaats/mutations.ts#L12), while the main save/persistence path lives in [actions.ts:142](/Users/ortwinverreck/Developer/bestbikefit4u/convex/bikeImports/actions.ts#L142) and [mutations.ts:264](/Users/ortwinverreck/Developer/bestbikefit4u/convex/bikeImports/mutations.ts#L264). Why it matters: the feature works, but the preview and persistence logic are not centered on one source of truth, which makes future fixes and audits harder. Block ship: no.

- Unknown bike type is silently normalized to `road` on the client, which weakens review quality on low-confidence adverts. The fallback happens in [marktplaatsImport.ts:56](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/marktplaatsImport.ts#L56) and is then written into the draft in [marktplaatsImport.ts:220](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/marktplaatsImport.ts#L220). Why it matters: weak parses still show a confidence badge and warning, but the draft starts from a concrete bike type instead of an empty/neutral state, which increases the chance of saving the wrong type if the rider does not notice. Block ship: no.

- The server-side advert fetch path does not implement the response guards described in the parser closeout. Preview fetch in [actions.ts:52](/Users/ortwinverreck/Developer/bestbikefit4u/convex/marktplaats/actions.ts#L52) has no timeout, content-type check, or response-size cap before [actions.ts:71](/Users/ortwinverreck/Developer/bestbikefit4u/convex/marktplaats/actions.ts#L71) reads the full body. Why it matters: malformed, non-HTML, or unusually large advert responses can degrade operational behavior more than the plan intended. Block ship: no.

### Low

- Rider-facing copy still includes a stale “backend unavailable” message even though backend actions now exist. The stale message remains in [en.ts:1964](/Users/ortwinverreck/Developer/bestbikefit4u/src/i18n/messages/en.ts#L1964) and the UI still branches on it in [MarktplaatsBikeImportFlow.tsx:102](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/MarktplaatsBikeImportFlow.tsx#L102) and [MarktplaatsBikeImportFlow.tsx:144](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/MarktplaatsBikeImportFlow.tsx#L144). Why it matters: if a generic backend error is ever mapped to that branch later, the user-facing explanation will be misleading. Block ship: no.

- Existing closeout documentation is stale about backend readiness. [output-03-ui-closeout.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-marktplaats-bike-import/output-03-ui-closeout.md) still says preview/save cannot complete because backend contracts are missing, which no longer matches the current code. Why it matters: the audit trail is less reliable for future maintainers. Block ship: no.

- Repo-wide `typecheck` is currently red, but the failures are outside this feature. Current failures are in `convex/authLocalDev.test.ts` and `src/lib/reports/pdfLayoutTemplate.test.ts`. Why it matters: I cannot claim a globally clean workspace even though the targeted Marktplaats test suite passes. Block ship: no for this feature specifically, but it is a repo-quality gap.

## Acceptance Scorecard

- `a valid Marktplaats advert URL can be submitted from the rider dashboard` — `pass`
- `invalid or unsupported URLs are rejected with a clear error` — `pass`
- `the backend never trusts raw client-parsed advert data` — `pass`
- `the import preview always appears before the bike is created` — `pass`
- `the rider can edit name, brand, model, bike type, and description before save` — `pass`
- `the advert description is copied into the bike description field on first import` — `pass`
- `at least one selected advert photo is imported when the listing exposes valid image URLs` — `pass`
- `imported photos are stored through the existing bike photo flow and one photo becomes primary` — `pass`
- `the resulting bike opens correctly on the existing bike detail page` — `partial`
- `the feature never adds geometry automatically` — `pass`
- `if brand/model confidence is low, the rider sees editable fallback fields instead of silent guesses` — `pass`
- `duplicate import protection exists for the same rider and advert URL` — `pass`
- `the rider-facing bike name is editable and does not have to equal the advert title` — `pass`
- `the original advert URL and advert title remain traceable after import` — `pass`
- `a failed image import does not prevent the bike from being created when core bike data is valid` — `pass`
- `a parser or fetch failure never creates a partial bike record` — `pass`

## Success Scorecard

### Product Success

- `riders can create a usable bike record from a Marktplaats advert in under one minute` — `at risk`
- `the imported bike usually needs only light correction, not full re-entry` — `at risk`
- `imported photos and advert text make the bike page immediately useful` — `achieved`
- `the preview gives the rider enough confidence to save without opening the raw advert again in most cases` — `at risk`

### Operational Success

- `parser failures degrade into a clear reviewable error instead of partial silent corruption` — `achieved`
- `image import failures do not create broken bike records` — `achieved`
- `repeated import attempts for the same advert are idempotent or clearly deduplicated` — `achieved`
- `the import audit trail is sufficient to debug bad parses without inspecting production HTML manually` — `achieved`

### Delivery Success

- `the implementation reuses the current bike and bike photo model` — `achieved`
- `the feature is covered by unit tests for parser behavior and integration tests for import persistence` — `achieved`
- `no existing manual bike creation or bike page behavior regresses` — `at risk`
- `subagent work can proceed with disjoint ownership and no high-conflict core file overlap` — `achieved`

## Code Quality Verdict

The implementation is functionally coherent and the core persistence path is materially stronger than the earlier UI closeout implied. The schema additions in [schema.ts:377](/Users/ortwinverreck/Developer/bestbikefit4u/convex/schema.ts#L377) and [schema.ts:453](/Users/ortwinverreck/Developer/bestbikefit4u/convex/schema.ts#L453), the guarded save workflow in [mutations.ts:264](/Users/ortwinverreck/Developer/bestbikefit4u/convex/bikeImports/mutations.ts#L264), and the photo-ingest safeguards in [actions.ts:92](/Users/ortwinverreck/Developer/bestbikefit4u/convex/bikeImports/actions.ts#L92) are solid.

The main quality weakness is architectural drift, not a single broken path. Preview still runs through the older `convex/marktplaats/*` layer while save runs through `convex/bikeImports/*`, and the client adds normalization behavior that the backend contract does not require. That makes the feature harder to reason about and easier to regress.

Validation performed:

- `npx vitest run convex/marktplaats/__tests__/parser.test.ts convex/bikeImports/__tests__/shared.contract.test.ts convex/bikeImports/__tests__/mutations.contract.test.ts convex/bikeImports/__tests__/actions.contract.test.ts` — passed `13/13`
- `npm run typecheck` — failed on unrelated existing test files outside this feature

No implementation code was changed for this audit. No audit-only fix was applied.

## Final Ship Recommendation

`ship with known gaps`

Reasoning:

- The core rider flow exists and satisfies the main data-integrity and persistence requirements.
- I did not find a blocker that would force `do not ship`.
- The remaining gaps are real, but they are primarily maintainability and review-quality issues:
  - split preview/save contract ownership
  - client-side `road` fallback for uncertain bike type
  - missing fetch guards on the preview path
  - stale copy and stale closeout documentation

Recommended follow-up order:

1. Remove the silent `road` fallback for unknown bike type in the client preview normalizer.
2. Consolidate preview onto the `bikeImports` contract so preview and save share one backend shape.
3. Add timeout/content-type/response-size guards to the preview fetch path.
4. Clean up stale copy and stale closeout output.
