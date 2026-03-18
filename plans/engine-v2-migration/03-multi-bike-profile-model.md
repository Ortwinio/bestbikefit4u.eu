# 03 — Multi-Bike / Multi-Profile Model

## Objective

Implement the domain model that lets one user own multiple bikes and multiple fit profiles per bike without collapsing the current session flow.

## In Scope

- define the bike profile entity and ownership rules
- decide how a fit session references bike, profile, and engine version
- support a base profile per bike plus additional named profiles
- define legacy mapping for users who only have a single historical fit context
- preserve current bike creation and selection paths while adding profile-aware logic

## Key Decisions To Lock

- whether bike profiles live in a new table or as embedded objects
- whether sessions always require a bike profile or can start profile-less and attach later
- whether the default imported profile name is `Base`
- how profile type is normalized across road, gravel, mountain, city, and TT categories

## Expected Repo Touchpoints

- `convex/schema.ts`
- `convex/sessions/mutations.ts`
- `convex/sessions/queries.ts`
- `convex/bikes/queries.ts`
- `src/app/(dashboard)/fit/page.tsx`
- `src/app/(dashboard)/bikes/`

## Deliverables

- domain model decision record
- backend create/list/get/update support for bike profiles
- compatibility behavior for existing bikes and sessions

## Exit Criteria

- a bike can have a default profile and at least one additional profile
- sessions can be associated with the correct bike/profile combination
- ownership and auth checks remain intact
- existing users without profiles can still access their data safely
