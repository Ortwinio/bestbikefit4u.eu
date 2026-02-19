# Step 01: Audit BikeFit AI Application

## Objective

Establish a complete baseline of how the current BikeFit AI application behaves and where brand/domain references exist.

## Inputs

- `plans/refactor-bikefit-ai-to-bestbikefit4u/README.md`
- `src/app/**/*`
- `src/components/**/*`
- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`
- `convex/**/*`
- `docs/**/*`
- `.env.example`

## Tasks

1. Run a codebase audit to inventory all `BikeFit AI`, `bikefit.ai`, and brand-adjacent references.
2. Classify each reference into:
   - user-facing UI copy
   - metadata/SEO/structured data
   - transactional communications (auth/report emails)
   - generated artifacts (PDF/report titles)
   - environment/deployment/docs/tests
3. Perform an app-level smoke pass for critical routes:
   - public pages
   - auth sign-in flow
   - dashboard session/results flow
   - calculators
4. Identify risks where replacement could break behavior (env vars, sender address, links, legal copy).
5. Save findings to `plans/refactor-bikefit-ai-to-bestbikefit4u/output-01-audit-findings.md`.
6. Update plan status in `plans/refactor-bikefit-ai-to-bestbikefit4u/README.md`.

## Deliverable

- A prioritized audit report with reference inventory, risk notes, and replacement sequencing input.

## Completion Checklist

- [ ] All brand/domain reference categories are inventoried.
- [ ] Critical user flows are smoke-tested and documented.
- [ ] Replacement risks and blockers are listed with severity.
- [ ] Output file is created and linked in the plan README.
