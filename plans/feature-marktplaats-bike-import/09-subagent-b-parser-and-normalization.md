# 09 — Subagent B Prompt: Parser And Normalization

## Mission

Own the server-side Marktplaats fetch, parse, and deterministic normalization layer.

## Read First

- `plans/feature-marktplaats-bike-import/README.md`
- `plans/feature-marktplaats-bike-import/02-import-contract-and-parser.md`
- `plans/feature-marktplaats-bike-import/05-deduplication-errors-and-safety.md`
- output from Subagent A once available

## Ownership

You own:

- new parser modules under `src/lib/marktplaats/*` or `convex/marktplaats/*`
- parser fixtures and parser tests
- deterministic brand/model/type normalization helpers

You do **not** own:

- dashboard UI
- bike persistence
- storage upload code for photos unless needed for parser test doubles

## Required Work

1. Accept only Marktplaats URLs in v1.
2. Implement server-side fetch and parse from the advert URL.
3. Prefer structured data or canonical metadata when present, then HTML selectors.
4. Extract:
   - advert title
   - canonical URL
   - description
   - image URLs
   - candidate brand
   - candidate model
   - candidate bike type
5. Implement deterministic normalization and keyword mapping, including Dutch terms like:
   - `tijdritfiets`
   - `racefiets`
   - `gravel`
   - `mtb`
6. Emit per-field confidence or explicit review-needed flags.
7. Add fixture-based tests for strong, weak, and malformed adverts.

## Constraints

- do not use an LLM in v1 parser behavior
- do not infer geometry
- do not silently guess high-confidence brand/model from weak evidence
- parser must fail loudly and structurally, not with ambiguous null soup

## Non-goals

- do not build preview UI
- do not write bike/photo persistence

## Acceptance Criteria For This Prompt

- valid advert fixtures parse into the canonical contract
- malformed and unsupported pages fail safely
- confidence is present for uncertain brand/model/type fields
- no geometry fields are present in parser output

## Required Output

Create:

- `plans/feature-marktplaats-bike-import/output-02-parser-audit.md`

That file must state:

- extraction strategy
- normalization rules
- confidence rules
- fixture coverage
- known brittle areas
