# Step 01 — Schema & Convex Layer

## Goal

Add the two new schema fields, update affected mutations/queries, wire up the new Convex endpoints needed by later steps, and define the destructive-action contract for bikes, fit sessions, and pressure calculations.

## Lifecycle Contract First

Before adding new history surfaces, make the data-ownership and deletion policy explicit:

- `bikes.remove` already exists, but it currently deletes only the bike row
- No delete/archive endpoint currently exists for fit sessions
- No delete endpoint currently exists for pressure calculations

This step must produce one of these outcomes:

1. Recommended: harden bike deletion now and explicitly defer fit-session / pressure-calculation deletion
2. Alternative: add safe delete/archive endpoints for fit sessions and/or pressure calculations if product scope is expanded

At minimum, document the decision in code comments or the plan README so later UI steps do not assume missing destructive actions.

## Schema Changes

### `convex/schema.ts`

Add to the `bikes` table definition (after `updatedAt`):
```ts
notes: v.optional(v.string()),
```

Add to the `pressureCalculations` table definition (after `createdAt`):
```ts
userNotes: v.optional(v.string()),
autoNoteSource: v.optional(v.string()), // e.g. "weight_change_75kg"
```

## Convex Mutations to Update

### `convex/bikes/mutations.ts`

- `create` — add optional `notes` arg (`v.optional(v.string())`)
- `update` — add optional `notes` arg; validate with `validateShortString` if provided (max 500 chars — increase limit or use a new helper for longer free text)
- `remove` — do not leave as a single `ctx.db.delete(args.bikeId)` call if related records remain behind; either:
  - cascade-delete dependent records safely, or
  - block deletion when dependent records exist and return a clear product-level error the UI can show

> Use `validateStringLength(notes, 500)` pattern from `convex/lib/validation.ts`.

### `convex/pressureCalculations/mutations.ts`

- `create` (or equivalent save mutation) — add optional `userNotes` and `autoNoteSource` args
- Add a new `updateNotes` mutation that accepts `{ id, userNotes }` to allow inline editing of an existing calculation's notes

## New Convex Queries

### `convex/sessions/queries.ts`

Add a query `getSessionsWithRecommendationsByBike`:
- Args: `{ bikeId: v.id("bikes") }`
- Auth: `requireUserId` + verify bike belongs to user
- Returns: array of `{ session, recommendation }` pairs ordered by `createdAt DESC`
- Joins: `fitSessions` where `bikeId` matches + lookup `recommendations` by `sessionId`

### `convex/sessions/queries.ts`

Add a query `getAllSessionsWithBikes`:
- Args: none
- Auth: `requireUserId`
- Returns: array of `{ session, bike, recommendation }` ordered by `createdAt DESC`
- Used by the new Bike Fitting history screen

### `convex/pressureCalculations/queries.ts`

Add a query `getLatestByBike`:
- Args: `{ bikeId: v.id("bikes") }`
- Auth: `requireUserId` + verify bike ownership
- Returns: the most recent `pressureCalculation` for that bike (or `null`)

### `convex/bikes/mutations.ts`

Add a mutation `recalculatePressureForBike` (or call the existing pressure engine):
- Args: `{ bikeId, newWeightKg, autoNoteSource }`
- Auth: `requireUserId`
- Resolves the active wheelset + tire setup for the bike, runs the pressure calculation engine (same logic as the wizard), saves a new `pressureCalculation` with `autoNoteSource` set
- Returns: the new `pressureCalculation` id

> This may need to be a Convex **action** if it calls external logic, or a mutation that re-uses the internal calculation helper.

## Optional Lifecycle Endpoints

Only add these if product decides the new history/overview surfaces should support deletion now:

### `convex/sessions/mutations.ts`

Potential new mutation `remove` or `archive`:
- Args: `{ sessionId: v.id("fitSessions") }`
- Auth: `requireSessionOwner`
- Must define cascade behavior for:
  - questionnaire responses
  - recommendations / recommendation shadows
  - ride feedback
  - validation captures
  - any other `sessionId`-keyed tables

### `convex/pressureCalculations/mutations.ts`

Potential new mutation `remove`:
- Args: `{ calculationId: v.id("pressureCalculations") }`
- Auth: verify row belongs to current user
- Safer than fit-session delete because the record graph is flatter, but still needs an explicit decision

## Validation Helpers

In `convex/lib/validation.ts`, check if `validateStringLength` supports lengths above 100. If not, the `notes` field (500 chars) and `userNotes` (300 chars) need a direct `v.string()` validator with a length check in the mutation body rather than a reusable helper. Add `validateMediumString` (max 500) if the pattern doesn't exist yet.

## Acceptance Criteria

- [ ] `convex/schema.ts` compiles with the two new optional fields
- [ ] `bikes.update` mutation accepts and saves `notes`
- [ ] `pressureCalculations` save mutation accepts `userNotes` and `autoNoteSource`
- [ ] `updatePressureNotes` mutation allows inline editing of a calculation's notes
- [ ] `getSessionsWithRecommendationsByBike` query returns sessions for a bike, newest first
- [ ] `getAllSessionsWithBikes` query returns all sessions for the current user with bike/recommendation context
- [ ] `getLatestByBike` query returns the most recent pressure calculation per bike
- [ ] All new endpoints use `requireUserId()` auth pattern
- [ ] Bike deletion behavior is explicitly safe: either cascade-backed or intentionally blocked with a clear message
- [ ] The plan/codebase explicitly records whether fit-session and pressure-calculation deletion are deferred or implemented
