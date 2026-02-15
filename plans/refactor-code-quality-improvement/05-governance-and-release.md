# Step 05: Governance And Release Controls

## Objective

Prevent future drift by adding lightweight process controls around code quality and plan maintenance.

## Inputs

- `AGENTS.md`
- Active plan READMEs
- CI workflow files

## Tasks

1. Define required pre-merge checks: lint, typecheck, tests, and plan status update for scoped plan work.
2. Add a PR checklist template for:
   - quality checks passed
   - docs/plan status updated
   - migration/seed impact reviewed
3. Add a weekly maintenance routine for `plans/`, `messages/`, and `context/INDEX.md` status hygiene.
4. Add simple release readiness checklist (functional smoke paths + auth and recommendation checks).
5. Document ownership for plan curation and quality gate failures.

## Deliverable

- Lightweight governance model that keeps documentation and code quality synchronized

## Completion Checklist

- [x] PR checklist exists and is used
- [x] CI gates are non-optional for merge
- [x] Plan/message hygiene routine is documented
- [x] Release checklist is documented and testable
