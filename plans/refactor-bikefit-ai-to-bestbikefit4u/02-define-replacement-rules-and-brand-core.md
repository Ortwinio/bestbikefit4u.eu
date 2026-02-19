# Step 02: Define Replacement Rules And Brand Core

## Objective

Define the canonical BestBikeFit4U identity model and the exact replacement rules before code edits.

## Inputs

- `plans/refactor-bikefit-ai-to-bestbikefit4u/README.md`
- `plans/refactor-bikefit-ai-to-bestbikefit4u/output-01-audit-findings.md`
- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`
- `src/app/layout.tsx`
- `docs/VERCEL_DEPLOYMENT.md`
- `.env.example`

## Tasks

1. Define canonical brand values:
   - product name
   - email sender display name
   - primary domain(s)
   - metadata defaults (title suffix, OG site name)
2. Design a centralized brand configuration approach (for example `src/config/brand.ts`) to avoid future hardcoded drift.
3. Create replacement rules for:
   - exact text matches (`BikeFit AI` -> `BestBikeFit4U`)
   - domain/email strings
   - legal/SEO wording that needs contextual updates instead of blind replace
4. Define exceptions where old references may stay (historical docs, archived plan outputs, changelog context).
5. Save the specification to `plans/refactor-bikefit-ai-to-bestbikefit4u/output-02-brand-replacement-spec.md`.
6. Update plan status in `plans/refactor-bikefit-ai-to-bestbikefit4u/README.md`.

## Deliverable

- A replacement spec that can be executed with low risk and reused for future branding updates.

## Completion Checklist

- [ ] Canonical brand constants are explicitly defined.
- [ ] Centralization strategy is approved and documented.
- [ ] Replacement and exception rules are unambiguous.
- [ ] Output file is created and linked in the plan README.
