# Step 03: Build Layout Template And Sections

## Objective

Implement a production-ready report template that mirrors the example structure and keeps value placeholders bound to the mapping contract.

## Inputs

- `plans/feature-pdf-layout-upgrade/output-02-value-mapping-matrix.md`
- `scripts/generate-example-report.mjs`
- `BestBikeFit4U_ExampleReport_EN_v2.pdf`
- chosen renderer abstraction from Step 01

## Tasks

1. Build reusable template sections:
   - header metadata
   - summary cards
   - priority callout
   - core target table
   - implementation plan table
   - warning callout
   - measurement definitions
2. Implement style tokens (spacing, typography, colors) aligned with example visual hierarchy.
3. Add template binding layer that injects only mapped/validated values.
4. Ensure pagination behavior is deterministic for A4 output and section breaks.
5. Keep a minimal fallback layout path for missing optional assets/content.
6. Save implementation notes to `plans/feature-pdf-layout-upgrade/output-03-layout-implementation-notes.md`.
7. Update plan status in `plans/feature-pdf-layout-upgrade/README.md`.

## Deliverable

- New layout template implementation with stable section rendering and mapped value placeholders.

## Completion Checklist

- [ ] All required example sections are represented in code.
- [ ] Styles are consistent and production-safe.
- [ ] Placeholder binding uses only approved mapping contract fields.
- [ ] Output file created and linked in plan progress.
