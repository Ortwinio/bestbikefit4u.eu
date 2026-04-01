# BP-02 — Rate-Limited Lookup and Preview Token Flow

## Objective

Build the public lookup entrypoint that accepts a public fit code, rate-limits abuse, returns a preview-safe bike summary, and issues a short-lived preview token for later quick-match calls.

## User story

As a visitor, I want to enter a public bike fit code and safely preview the bike before I decide whether to check the compatibility estimate.

## Business value

- enables anonymous top-of-funnel conversion
- keeps private bike/account data protected
- limits code enumeration risk

## Dependencies

- BP-01 complete
- Upstash envs available for Vercel if using Upstash
- preview token secret documented and set

## Implementation rules

### Public lookup response

The response may include only:

- `brand`
- `model`
- `bikeType`
- `sizeLabel`
- `geometryQuality`
- `primaryPhotoUrl`
- `thumbnailUrls`
- `previewToken`

It must not include:

- `bikeId`
- `bikePassportId`
- `publicFitCode`
- owner identity
- account or claim data

### Token rules

- short-lived token, 10 minutes max
- signed server-side
- payload should be minimal:
  - internal bike identifier
  - token version
  - issued-at / expiry
- every token-backed route must re-check:
  - bike still exists
  - `publicFitEnabled === true`
  - code/token version still valid

## Security / abuse rules

- limit: 3 code submissions per IP per 5 minutes
- invalid and valid lookups both count toward the limit
- invalid code and disabled-preview responses must look identical to the client
- if rate-limiter infrastructure is unavailable, fail open and log a server warning

## Logging / telemetry

Do not add a broad `securityEventLog` table in this sprint.

Use:

- existing typed analytics where appropriate for client-side behavior
- minimal server logging / degraded warnings for infrastructure issues
- optional lightweight Convex security mutation only if there is an already-established internal pattern to store this safely

If persistence is added, it must be:

- minimal
- privacy-safe
- explicitly justified

## Acceptance criteria

- [ ] valid lookup returns `200` with preview-safe payload
- [ ] invalid code returns `404` with the same public-facing body as disabled preview
- [ ] 4th request in 5 minutes returns `429` with `Retry-After`
- [ ] `GET` to the route returns `405`
- [ ] response body never includes internal or owner identifiers
- [ ] expired or revoked token cannot be used on later endpoints

## Edge cases

- preview disabled after token issuance
- code regenerated in the future
- no primary photo available
- invalid JSON body
- missing rate-limiter envs in development

## Analytics events

- `bike_public_fit_lookup_submitted`
- `bike_public_fit_lookup_succeeded`
- `bike_public_fit_lookup_failed`
- `bike_public_fit_rate_limited`

No raw IP, no public fit code, no internal bike ID in analytics payloads.

## Human audit checks

- verify valid and invalid flows are visually distinct only by success/failure, not by enumerability hints
- inspect network response and confirm no internal IDs are present
- disable preview after issuing a token and verify the token-backed route stops working

## Testing

- route tests for `200`, `404`, `405`, `429`
- token tests for issue/verify/expired/revoked behavior
- fallback tests when rate-limiter envs are absent
- privacy contract tests for response shape

