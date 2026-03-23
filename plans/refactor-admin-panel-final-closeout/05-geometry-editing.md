# Step 05: Geometry Editing

## Objective

Close the biggest explicit acceptance gap in geometry: editing existing records with change reason while preserving version history.

## Tasks

1. Add a backend mutation for editing geometry record fields.
2. Decide the editing model:
   - in-place edit for draft records only
   - versioned edit for active records
   - or always create a new version from edit
3. Require a change reason for edit/version flows.
4. Update the geometry record UI so it is no longer read-only.
5. Keep approve/reject/version actions aligned with the chosen editing model.
6. Add tests for:
   - edit existing record
   - preserve history/version semantics
   - audit log payload contains change reason

## Done When

- geometry supports add, edit, and version with change reason
