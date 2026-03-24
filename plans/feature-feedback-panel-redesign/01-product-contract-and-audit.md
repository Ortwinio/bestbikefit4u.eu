# Step 01 — Product Contract And Current-State Audit

## Goal

Lock the redesign contract before implementation so the team does not build a new panel on top of an ambiguous data model.

## Tasks

1. Audit the current feedback implementation across:
   - `src/components/feedback/*`
   - `src/app/(dashboard)/feedback/page.tsx`
   - `convex/feedback/*`
   - `src/components/admin/feedback/*`
   - rider dashboard message surfaces
2. Produce a concrete gap table:
   - what exists
   - what is reusable
   - what must be removed
   - what must be migrated
3. Freeze the canonical submission taxonomy:
   - `bug`
   - `feature_request`
   - `support_case`
   - `review`
4. Define anonymous-submission behavior explicitly.
5. Define the structured context payload:
   - URL and route info
   - locale
   - auth state and user snapshot
   - linked bike / fit session
   - user-action trail
   - browser/environment metadata
6. Decide whether the current schema can absorb the new fields directly or needs additive fields / table support.

## Deliverable

A written audit output document with:

- current-state inventory
- approved product contract
- migration decisions
- schema delta list

## Done When

- There is no ambiguity about what replaces the old flow.
- The submission payload contract is explicit and implementation-ready.
- The team knows exactly which existing components are refactor targets.
