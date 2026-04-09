# Step 01: Dashboard Audit And Implementation Matrix

## Objective

Produce a concrete current-state audit of the dashboard environment and a file-level implementation matrix for the harmony work.

## Inputs

- `src/app/(dashboard)/layout.tsx`
- `src/components/layout/DashboardSidebar.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/fit/page.tsx`
- `src/app/(dashboard)/settings/page.tsx`
- `src/app/(dashboard)/bikes/page.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`
- `src/components/ui/*`
- `src/components/prototyper-ui/ui/*`
- `src/app/globals.css`

## Tasks

1. Audit the dashboard shell and representative pages for:
   - shell background and sidebar treatment
   - card hierarchy
   - page header patterns
   - CTA patterns
   - support/info/warning states
2. Inventory dashboard component usage:
   - direct Prototyper UI imports
   - `@/components/ui` wrappers backed by Prototyper UI
   - remaining wrappers/components that still feel legacy or off-contract
3. Identify slider-based controls and mark them as approved exception surfaces.
4. Create a file-level matrix that assigns each touched file one of:
   - shell contract
   - shared primitive alignment
   - page-level harmony pass
   - validation-only
5. List the top visual inconsistencies that most harm harmony with the public site.

## Deliverable

A written audit and implementation matrix that another agent can use as the source of truth for the rest of the plan.

## Completion Checklist

- [ ] Representative dashboard surfaces are audited.
- [ ] Prototyper UI versus wrapper usage is inventoried.
- [ ] Slider exceptions are explicitly documented.
- [ ] A file-level implementation matrix exists.
- [ ] Highest-leverage dashboard inconsistencies are prioritized.
