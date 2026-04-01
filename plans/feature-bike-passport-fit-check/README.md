# Plan: Bike Passport Fit Check

## Goal

Let a second-hand bike seller share a public fit-preview code for one bike, so a visitor can run a limited, honest size-compatibility check before creating an account.

This sprint ships a narrow MVP:

- owner opt-in public fit code per bike
- secure, rate-limited public preview lookup
- anonymous Quick Match based on height and known bike geometry
- authenticated follow-up CTA state for better precision
- owner-facing toggle and public-fit status on the bike edit/detail surfaces

It does **not** ship a full stored Profile Match engine in this sprint.

## Why the plan changed

The previous version drifted away from the current bike data model in three ways:

1. It treated `fitSnapshot` as a parallel source of truth instead of deriving from the existing bike geometry sources.
2. It mixed bike facts with rider-derived assumptions, especially around saddle-height range.
3. It tried to ship public lookup, two scoring engines, two new tables, Redis rate limiting, JWT flow, homepage UI, and authenticated recalculation in one sprint.

This updated plan keeps the scope shippable and aligned with the current model:

- canonical bike geometry source remains `geometryRecordId`
- manual `currentGeometry` is fallback only
- no inferred “bike fit range” fields are stored on `bikes`
- Quick Match is explicit heuristic guidance, not a fit verdict
- authenticated full Profile Match is moved to a follow-up sprint

## Current codebase alignment

Validated against the current application state:

- `bikes.bikePassportId` already exists and is used for copy/import
- `bikes.geometryRecordId` already exists and is the canonical geometry link
- `bikes.currentGeometry` remains the manual fallback geometry source
- `bikes.currentSetup` exists but is rider/setup-specific, not canonical bike geometry
- bike edit/detail pages already show passport and linked geometry
- `profiles` already contains the rider fields needed for a later full Profile Match

## Sprint scope

### In scope

- add `publicFitCode` and `publicFitEnabled` to `bikes`
- derive a **preview-safe geometry snapshot** from canonical bike geometry sources
- add a public lookup route with rate limiting and signed preview tokens
- add an anonymous Quick Match engine with a max score of 75
- add homepage `BikeQuickCheckCard`
- add owner controls to enable/disable public fit preview
- add a lightweight authenticated follow-up state:
  - “Get a better estimate with your inseam and rider profile”
  - no full 0-100 Profile Match yet
- add tests for contract, security, heuristic rules, and UI states

### Explicitly out of scope

- full authenticated Profile Match scoring engine
- `fitAssessments` persistence for anonymous lookups
- long-lived `securityEventLog` analytics table
- public ranking/comparison across bikes
- claims that a bike “fits” the rider
- storing saddle adjustment ranges derived from a prior owner’s setup
- auto-linking to recommendation sessions or bike-fit reports

## Data model rules

### Public fit code

- separate from `bikePassportId`
- opt-in per bike
- stable across disable/re-enable
- never shown publicly together with account identity or internal IDs

### Geometry source precedence

Every preview and score must use this source order:

1. linked geometry via `bikes.geometryRecordId`
2. manual fallback via `bikes.currentGeometry`
3. no geometry data

If geometry is absent, the system may still return a limited state, but it must not invent frame geometry.

### Preview snapshot contract

If a snapshot is stored on `bikes`, it must be a narrow cache of **bike facts only**:

- `bikeType`
- `sizeLabel`
- `stackMm`
- `reachMm`
- `geometryQuality`
- `source`
- `snapshotUpdatedAt`

It must not store:

- saddle min/max range derived from `currentSetup`
- rider-specific fit targets
- setup-based claims presented as bike capability

## Product rules

### Public result framing

- score is shown as `{score}/75`, never as a percentage
- result must state that it is a limited estimate
- result must say it is based on height and available bike geometry
- confidence must always be visible
- if data is weak, the UI must say so plainly

### Allowed user-facing language

- “Could suit your size”
- “Looks compatible on paper”
- “Limited estimate based on available geometry”
- “Add your inseam for a better estimate”
- “Use this as a first screening step, not as a final fit decision”

### Forbidden user-facing language

- “This bike fits you”
- “Fit confirmed”
- “Scientifically matched”
- “Accurate fit score”
- “Guaranteed fit”

## Implementation tickets

| Ticket | Title | Status |
|---|---|---|
| BP-01 | Public Fit Data Contract and Preview Snapshot | Done |
| BP-02 | Rate-Limited Lookup and Preview Token Flow | Done |
| BP-03 | Quick Match Heuristic Engine and API | Done |
| BP-04 | Homepage Quick-Check Card | Done |
| BP-05 | Owner Controls and Authenticated Follow-up UI | Done |
| BP-06 | Validation, Analytics, Audit, and Rollout | Done |

## Execution pack

- [01-data-model.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-passport-fit-check/01-data-model.md)
- [02-rate-limited-lookup-endpoint.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-passport-fit-check/02-rate-limited-lookup-endpoint.md)
- [03-quick-match-engine.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-passport-fit-check/03-quick-match-engine.md)
- [04-homepage-quick-check-card.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-passport-fit-check/04-homepage-quick-check-card.md)
- [05-owner-controls-and-follow-up.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-passport-fit-check/05-owner-controls-and-follow-up.md)
- [06-validation-analytics-and-rollout.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-passport-fit-check/06-validation-analytics-and-rollout.md)
- [07-implementation-roadmap.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-passport-fit-check/07-implementation-roadmap.md)
- [08-subagent-a-data-contract-and-security.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-passport-fit-check/08-subagent-a-data-contract-and-security.md)
- [09-subagent-b-quick-match-engine-and-api.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-passport-fit-check/09-subagent-b-quick-match-engine-and-api.md)
- [10-subagent-c-public-ui.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-passport-fit-check/10-subagent-c-public-ui.md)
- [11-subagent-d-owner-ui-and-follow-up.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-passport-fit-check/11-subagent-d-owner-ui-and-follow-up.md)
- [12-subagent-e-quality-audit-and-test-plan.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-passport-fit-check/12-subagent-e-quality-audit-and-test-plan.md)

## Sprint acceptance criteria

- [x] A bike owner can enable public fit preview and receive a `publicFitCode`
- [x] The same `publicFitCode` is shown again if the owner disables and re-enables preview
- [x] A public visitor can submit a valid code and get a preview-safe bike summary
- [x] The public response never exposes `bikeId`, `bikePassportId`, owner identity, or account data
- [x] Public lookup is rate-limited to 3 code submissions per IP per 5 minutes
- [x] A valid lookup issues a short-lived `previewToken`
- [x] Quick Match never exceeds `75/75`
- [x] Quick Match works only from height plus available bike geometry and clearly says so
- [x] Bikes with no linked/manual geometry return a limited-data result, not a misleading strong score
- [x] The homepage card handles invalid, expired, limited-data, and rate-limited states cleanly
- [x] The owner-facing bike settings surface explains what is publicly shared and what is not
- [x] All public strings are available in EN and NL
- [x] `npm run build:vercel` passes

## Success criteria

### Product success

- visitors can screen a second-hand bike without creating an account
- owners understand the public-preview feature and privacy boundary
- the system creates curiosity to continue with a fuller rider profile, without overstating accuracy

### Technical success

- no parallel geometry truth is introduced
- no public endpoint leaks internal bike or user identifiers
- public lookup remains usable under normal load and degrades safely if rate-limiter infrastructure is unavailable
- the heuristic engine is deterministic and covered by tests

### Trust success

- every visible score includes a confidence state
- every public result makes its limits clear
- no copy implies professional fit certainty

## Analytics events

This sprint should use a tight, typed event set only:

- `bike_public_fit_enabled`
- `bike_public_fit_disabled`
- `bike_public_fit_code_copied`
- `bike_public_fit_lookup_submitted`
- `bike_public_fit_lookup_succeeded`
- `bike_public_fit_lookup_failed`
- `bike_public_fit_rate_limited`
- `bike_public_fit_quick_match_completed`
- `bike_public_fit_signup_cta_clicked`

No analytics event should include raw IP, public fit code, internal bike ID, or owner identity.

## Testing strategy

### Required automated coverage

- schema/query contract tests for public-fit lookup behavior
- token issue/verify tests
- rate-limit fallback tests
- heuristic engine boundary tests
- API route tests for 200 / 400 / 401 / 404 / 429
- UI state tests for homepage quick-check card
- owner-toggle tests for enable/disable/copy/re-enable behavior

### Required human audit checks

- verify all public copy remains hedged and trust-building
- verify invalid code and disabled-preview responses are indistinguishable to the user
- verify mobile layout at 375px for all quick-check states
- verify owner settings copy clearly says no personal details are shared
- verify weak-data bikes do not display high-confidence language

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Many bikes still lack linked or manual geometry | High | Show limited-data state, and prompt owners to add geometry before enabling preview |
| Heuristic score may be interpreted as a fit verdict | High | Force disclaimer and confidence badge in every result state |
| Rate-limiter service is unavailable | Medium | Fail open with server warning and minimal degraded telemetry |
| Token revocation is incomplete | Medium | Re-check current bike state on every token-backed route |
| Scope creep toward full Profile Match | High | Keep Profile Match out of this sprint and document it as follow-up work |

## Execution status

Implemented with subagent-assisted work allocation across:

- data contract and token/revocation security
- heuristic engine and API integration
- public quick-check UI
- owner controls and follow-up surfaces
- final audit and test-plan validation

Final verification completed in the main workspace:

- `npx convex codegen`
- `npx vitest run src/lib/previewToken.test.ts src/lib/fitEngine/quickMatch.test.ts src/app/api/public-fit/lookup/route.test.ts src/app/api/public-fit/quick-match/route.test.ts src/components/public/BikeQuickCheckCard.test.tsx src/components/bikes/bikePublicFitControls.test.tsx convex/bikes/__tests__/publicFit.contract.test.ts`
- `npm run build:vercel`

## Follow-up sprint candidates

- full authenticated Profile Match (0-100)
- optional persistence of rider-owned fit assessments
- richer bike suitability card inside garage/bike detail
- stronger anti-abuse controls if public traffic justifies them
