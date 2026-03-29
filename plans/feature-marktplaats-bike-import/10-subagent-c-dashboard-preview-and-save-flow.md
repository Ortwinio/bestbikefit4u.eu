# 10 — Subagent C Prompt: Dashboard Preview And Save Flow

## Mission

Own the rider-facing dashboard flow for pasting a Marktplaats URL, reviewing the parsed bike draft, editing it, and confirming the import.

## Read First

- `plans/feature-marktplaats-bike-import/README.md`
- `plans/feature-marktplaats-bike-import/03-dashboard-import-flow.md`
- `plans/feature-marktplaats-bike-import/07-implementation-roadmap.md`
- output from Subagent A and Subagent B once available
- current bike dashboard pages and bike creation flow

## Ownership

You own:

- rider-facing import entry point
- preview/review form
- loading, error, and success states
- any dashboard copy additions required for the flow

You do **not** own:

- parser internals
- backend storage schema
- remote image ingest implementation

## Required Work

1. Add a dashboard entry point for Marktplaats bike import.
2. Let the rider paste exactly one advert URL.
3. Call the backend parse preview flow.
4. Show a review surface before save with editable:
   - name
   - brand
   - model
   - bike type
   - description
   - selected photos
5. Show visible cues for uncertain fields.
6. Make clear that the bike name is editable and not locked to the advert title.
7. On confirmation, call the import save path and route to the created bike.
8. Add UI tests where practical.

## Constraints

- bike creation must not happen before review confirmation
- low-confidence fields must not masquerade as certain
- preserve EN/NL support if this surface is localized today
- do not add dashboard changes outside the bike import flow

## Non-goals

- do not implement parser logic
- do not implement storage download internals

## Acceptance Criteria For This Prompt

- rider can paste URL, preview, edit, and save
- invalid URLs and parser failures are surfaced clearly
- the preview always comes before persistence
- the created bike route is opened on success

## Required Output

Create:

- `plans/feature-marktplaats-bike-import/output-03-ui-closeout.md`

That file must state:

- chosen UI surface
- rider states covered
- copy additions
- known UX tradeoffs
