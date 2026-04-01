# Subagent A — Data Contract and Security Foundation

## Mission

Implement the bike-side data contract, preview snapshot derivation, public lookup route, and preview-token security model for the Bike Passport Fit Check MVP.

## Write scope

- `convex/schema.ts`
- `convex/bikes/mutations.ts`
- `convex/bikes/queries.ts`
- any small helper under `convex/bikes/`
- `src/lib/previewToken.ts`
- `src/lib/rateLimiter.ts`
- `src/lib/ipHash.ts`
- `src/app/api/public-fit/lookup/route.ts`

Do not edit homepage UI or bike settings UI.

## Requirements

- add `publicFitCode`, `publicFitEnabled`, `publicFitCodeCreatedAt`, `publicFitSnapshot`
- add `by_public_fit_code`
- derive snapshot from:
  - `geometryRecordId`
  - then `currentGeometry`
  - then `none`
- do not store saddle min/max range or other rider-derived fit assumptions
- keep public API response free of internal and owner identifiers
- token-backed routes must be revocation-safe

## Acceptance criteria

- valid public lookup returns preview-safe response only
- disabled preview and invalid code are indistinguishable publicly
- rate limiting works or degrades safely if infrastructure is absent
- token model re-checks bike state, not only signature

## Edge cases

- linked geometry absent
- linked geometry partial
- public preview disabled after token issuance
- development env without Upstash

## Tests required

- contract tests for public-fit mutations/queries
- lookup route tests for `200`, `404`, `405`, `429`
- token expiry/revocation tests

## Final handoff format

- changed files
- acceptance criteria met
- remaining risks

