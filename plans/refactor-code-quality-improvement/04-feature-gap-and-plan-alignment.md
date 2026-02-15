# Step 04: Feature Gap And Plan Alignment

## Objective

Align roadmap documents with implemented work and remaining backlog so planning is reliable.

## Inputs

- `docs/DEVELOPMENT_PLAN.md`
- `plans/next-steps/README.md`
- `plans/next-steps/03-missing-pages.md`
- `src/app/` routes

## Tasks

1. Update sprint checklist status in `docs/DEVELOPMENT_PLAN.md` to match repository reality.
2. Reconcile `plans/next-steps` entries with current pages and features.
3. Split remaining work into true open gaps:
   - Bikes frontend (`/bikes`)
   - Measurement guide page
   - PDF export
   - SEO science/calculator pages
4. Add explicit owner and target date fields in active plan README files.
5. Close or update stale message items in `messages/` based on resolved code changes.

## Deliverable

- Accurate and current planning artifacts
- Reduced duplicate/stale tasks

## Completion Checklist

- [x] Development plan status is up to date
- [x] Next-steps plan reflects only outstanding work
- [x] Each active plan has owner + date + status
- [x] Stale messages are resolved
