# Implementation Roadmap

## Goal

Execute the Bike Passport Fit Check MVP with parallel subagent work, minimal merge conflicts, and explicit validation gates.

## Execution order

### Stage 1 — foundation

Run first:

- Subagent A: data contract and secure lookup foundation

Outputs needed before later stages:

- final bike-side schema contract
- preview snapshot derivation rules
- lookup/token contract

### Stage 2 — parallel feature work

Run in parallel once Stage 1 is stable:

- Subagent B: Quick Match engine and quick-match API
- Subagent C: homepage quick-check card
- Subagent D: owner settings and authenticated follow-up UI

These streams should have disjoint ownership as much as possible.

### Stage 3 — validation and audit

Run last:

- Subagent E: independent quality audit and test review

## Ownership boundaries

- Subagent A owns:
  - `convex/schema.ts`
  - bike public-fit mutations/queries
  - preview token and lookup route utilities
- Subagent B owns:
  - `src/lib/fitEngine/**`
  - quick-match route
  - pure engine tests
- Subagent C owns:
  - homepage quick-check component
  - homepage integration
  - UI state tests for the public flow
- Subagent D owns:
  - bike settings public-fit controls
  - signed-in follow-up UI
  - related analytics hooks
- Subagent E owns:
  - acceptance audit
  - claim/copy audit
  - validation gap report

## Required validation gates

Before integration:

- each subagent must list changed files
- each subagent must list acceptance criteria met
- each subagent must list open risks

Before ship:

- `npx convex codegen`
- targeted vitest suite
- `npm run build:vercel`
- manual audit checklist from BP-06

