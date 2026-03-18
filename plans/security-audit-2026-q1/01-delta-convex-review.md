# Step 01 — Delta Convex Endpoint Review

## Objective

Audit all new or modified Convex mutations, queries, and actions added since the original security audit for auth boundaries and input validation.

## Tasks

1. Identify new/modified Convex files since `e79b451`:
   - Check `convex/` directory for files touched by tire pressure (`04b47ef`) and dashboard upgrade (`d7f66cc`) commits

2. For each new/modified endpoint, verify:
   - **Auth**: calls `requireUserId()` or `requireXOwner()` before accessing data
   - **Input validation**: all args use `v.` validators with tight constraints (no `v.string()` without length limits on user-controlled fields)
   - **Data isolation**: mutations only write to the authenticated user's data, never cross-user
   - **No `any` type args**: all args fully typed via Convex validators

3. Check for any new HTTP actions (`httpAction`) — these bypass Convex auth and need explicit validation

4. Review new `action` handlers — actions can make external HTTP calls; check for SSRF risk if user input reaches a URL

## Output

Document in `output-01-delta-convex-review.md`:
- Table: endpoint name | type | auth guard present | input validation | finding
- P0 findings (missing auth, SSRF risk) must be fixed before proceeding to Step 05
