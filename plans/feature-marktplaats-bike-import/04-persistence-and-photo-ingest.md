# Step 04 — Persistence And Photo Ingest

## Objective

Specify how the parsed advert becomes a real bike and real bike photos in the existing data model.

## Tasks

1. Decide whether the create step should:
   - call existing bike mutations plus photo mutations in sequence
   - or use one dedicated import mutation/action that owns the full workflow
2. Define how remote advert image URLs are downloaded and stored.
3. Define how one imported image becomes primary.
4. Define what happens if:
   - the bike is created but one image fails
   - all images fail
   - the description is too long or noisy
5. Define traceability fields for later support and deduplication.

## Product Rule

The bike record must never become half-broken because an image step failed.

## Deliverable

Create `output-04-persistence.md` with:

- write-path design
- storage flow
- rollback or degrade-gracefully behavior
- traceability field decisions
