# 07 — Implementation Roadmap

## Goal

Turn the Marktplaats bike import plan into a delivery sequence that can be executed with parallel subagents and a final audit.

## Delivery Order

### Phase 1 — Contract freeze

Owner:
- Subagent A

Exit conditions:
- import metadata storage shape is chosen
- bike source-traceability rules are fixed
- preview payload contract is stable
- save-flow mutation/action boundary is fixed

### Phase 2 — Parser foundation

Owner:
- Subagent B

Depends on:
- Phase 1 contract decisions

Exit conditions:
- server-side Marktplaats parser works on stored fixtures
- confidence rules are explicit
- unsupported URLs and malformed pages fail safely

### Phase 3 — Rider preview flow

Owner:
- Subagent C

Depends on:
- stable parsed advert payload from Phase 2

Exit conditions:
- rider can paste URL, preview draft, edit fields, and confirm save
- low-confidence fields are visibly reviewable
- no bike is created before confirmation

### Phase 4 — Persistence and ingest

Owner:
- Subagent D

Depends on:
- contract from Phase 1
- parser shape from Phase 2
- review payload from Phase 3

Exit conditions:
- confirmed imports create one bike
- selected remote photos are ingested safely
- duplicate and retry behavior is defined and tested
- telemetry hooks are added

### Phase 5 — Audit and acceptance closeout

Owner:
- Subagent E

Depends on:
- implementation complete in Phases 1-4

Exit conditions:
- acceptance criteria scorecard completed
- success criteria scorecard completed
- findings listed by severity
- ship / ship-with-gaps / do-not-ship recommendation issued

## Work Packages

### WP1 — Import data contract

- choose `bikeImports` versus overloading `bikes`
- freeze parsed advert type
- freeze preview-save contract

### WP2 — Marktplaats parser

- host validation
- HTML and structured-data extraction
- deterministic normalization
- fixture coverage

### WP3 — Rider preview UX

- entry point
- loading/error states
- preview editor
- save action

### WP4 — Storage and image ingest

- create bike
- create photo records
- primary-photo selection
- degrade-gracefully behavior

### WP5 — Safety and observability

- duplicate detection
- SSRF/host protections
- telemetry
- error taxonomy

### WP6 — Final audit

- acceptance evidence
- success evidence
- code quality verdict

## Acceptance Gate

The feature is not implementation-complete until all of the following are true:

- preview is mandatory before bike creation
- imported bike opens on the current bike detail page
- no geometry fields are added or inferred
- duplicate same-URL import behavior is deterministic
- parser unit tests and save-flow tests pass
- remote image failure behavior is safe and test-covered

## Success Scoring

### Product

- import speed
- edit effort after parsing
- photo usefulness

### Engineering

- no regression in manual bike creation
- parser contract is typed and testable
- import traceability is auditable

### Operational

- parse failures are diagnosable
- retries are safe
- hostile or malformed URLs are rejected early
