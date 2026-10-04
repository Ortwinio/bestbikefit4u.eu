# C3 retained files and narrow documentation updates

Uncertain files remain. Retention decisions are detailed in [source](C3-code-kept.md), [scripts/visual harnesses](C3-scripts-kept.md), and [documentation](C3-docs-kept.md).

## Additional root decisions

- `AGENTS.md`: retained unchanged as required; no obsolete brand/domain/Strava text found.
- `CLAUDE.md`: retained; corrected project name to BikeFitBoost, recorded https://bikefitboost.com, and corrected the obsolete claim that no HTTP endpoints exist (the report PDF uses a Next route handler).
- `convex/migrations/domainMigration.ts` and `retireStrava.ts`, their contracts and other registered Convex functions: retained. Both migrations are explicitly named in current `plans/migratie/audit/` runbooks; generated or manual invocation makes import absence insufficient deletion proof.
- All i18n keys and ambiguous compiler candidates stay; no test mocks or tooltip registry weakened to justify removal.
- Active guide imports and their JSON inputs, 18 October rider baseline, SEO/domain checkers, current media generation recipes and visual fixture dependencies stay.
- `tests/visual/image-weight/capture.mjs`, its 47-optimized manifest/original images and legacy logo fixture stay; B informed.

The source audit tool is reproducible at `plans/cleanup/C3-reachability.mjs`; candidate output always requires the documented second whole-repository reference review.
