# Implementation Roadmap

## Phase 1: Backend Contract

Owner: Subagent A

Deliver:

- richer advert description handling
- extracted signal summary contract
- parser coverage for description and image edge cases

Exit condition:

- preview payload contains the new summary and warning fields

## Phase 2: Preview UI

Owner: Subagent B

Deliver:

- structured advert summary section
- stronger large-photo preview
- thumbnail strip and selection feedback
- weak-photo warnings and explicit empty state

Exit condition:

- rider can review text and images clearly before save

## Phase 3: Audit

Owner: Subagent C

Deliver:

- acceptance scorecard
- success scorecard
- code quality findings
- ship recommendation

Exit condition:

- no high-severity findings remain

## Work Package Split

### WP1

Backend parser and preview payload.

Files likely owned:

- `convex/marktplaats/parser.ts`
- `convex/marktplaats/actions.ts`
- supporting tests

### WP2

Preview mapping and rider UI.

Files likely owned:

- `src/components/features/bikes/MarktplaatsBikeImportFlow.tsx`
- `src/components/features/bikes/marktplaatsImport.ts`
- supporting tests

### WP3

Independent audit and closeout.

Files likely produced:

- `output-01-preview-upgrade-audit.md`

