# Step 06 — Rider Data, Bikes & Geometry Library

## Goal

Build three related admin modules: rider data (measurement review), bike management, and the geometry library (brands, models, size records). These share the same theme of structured, versioned data that informs fit quality.

---

## Pre-requisites

- Steps 01–03 complete
- `geometry_brands`, `geometry_models`, `geometry_records` tables in schema (step 02)
- Geometry queries and mutations in admin backend (step 03)

---

## Part A — Rider Data & Measurements

### A1. Rider data list page

`src/app/(admin)/rider-data/page.tsx`

This is not a list of riders — that lives in Users. This page shows riders whose measurement data has quality flags requiring attention.

Show a review queue: all users who have at least one flag from the validation logic. For v1, a "flag" is any user where the system detects an unusual measurement combination (inseam outside expected range for height, etc.).

For v1, implement the queue as a simple list filtered to:
- `profiles` records where `heightCm` and `inseamCm` are present but inseam > 0.55 × height (likely unrealistic)
- Or `profiles` where at least one measurement is zero/null but the session has been attempted

**Table columns**: User name, height, inseam, weight, last fit date, "Review" link.

### A2. Rider measurement detail

`src/app/(admin)/rider-data/[userId]/page.tsx`

Shows the user's current `profiles` record with all body measurements. Fields:
- Height, inseam, arm span, torso length, shoulder width, foot length, weight
- Flexibility score (if present), core stability (if present)
- Goal, terrain preference, riding style
- Created at, updated at

**Admin actions (read-only in v1)**:
- "Flag for review" toggle
- Admin notes text field (store in a new `v.optional(v.string())` field `adminNotes` on `profiles` — add this to the schema if not already present)

No direct editing of rider measurements — raw inputs are immutable as per the design principles.

---

## Part B — Bikes

### B1. Bike list page

`src/app/(admin)/bikes/page.tsx`

All bikes across all users.

**Filters**: bike category, user search, has geometry linked (yes/no).

**Table columns**: Brand/model, size, category, owner name, linked geometry record (yes/no badge), created date, "View" link.

### B2. Bike detail page

`src/app/(admin)/bikes/[bikeId]/page.tsx`

Read-only for v1 — admins can view but not edit user bike data directly. Show:
- All bike fields: brand, model, year, size, category
- Current setup values: saddle height, setback, reach, etc.
- Linked geometry record: if linked, show the geometry size data inline
- Fit sessions using this bike: list with links

**Admin action**: "Link to geometry record" — opens a search dialog to find a `geometry_records` row and link the bike. Writes to the bike record's `geometryRecordId` field (add this to the `bikes` table schema: `geometryRecordId: v.optional(v.id("geometry_records"))`).

---

## Part C — Geometry Library

### C1. Brands list page

`src/app/(admin)/geometry/page.tsx` (redirects to brands list)
`src/app/(admin)/geometry/brands/page.tsx`

Table of all `geometry_brands`. Columns: name, model count, active records count, "View models" link.

**"New brand" button** → opens a dialog:
- Name (required)
- Slug (auto-generated from name, editable)
- Website (optional)
- On submit: calls `createGeometryBrand` mutation

### C2. Brand detail / Model list

`src/app/(admin)/geometry/brands/[brandId]/page.tsx`

Shows brand info and a table of `geometry_models` for this brand.

Columns: model name, category badge, year range, active size count, "View sizes" link.

**"New model" button** → dialog:
- Name, category (dropdown), year start, year end (optional), notes
- On submit: `createGeometryModel` mutation

### C3. Model detail / Size list

`src/app/(admin)/geometry/brands/[brandId]/models/[modelId]/page.tsx`

Table of all `geometry_records` for this model. Columns: size label, stack, reach, seat tube angle, source badge, status badge, version, reviewed by, "View/Edit" link.

**Status badges**: draft (gray), active (green), superseded (muted), rejected (red).

**"New size record" button** → opens a full-page form (not a dialog — too many fields).

**Geometry import button** (geometry_manager, super_admin only) — v1: bulk CSV import described below.

### C4. Geometry record detail / edit form

`src/app/(admin)/geometry/[recordId]/page.tsx`

Shows all geometry fields for a specific size record. If `status = "draft"`, the form is editable.

**Fields** (all numeric inputs in mm or degrees):
- Size label
- Stack, Reach
- Seat tube angle, Head tube angle (degrees)
- Wheelbase, Chainstay, BB drop
- Effective top tube, Standover, Fork rake
- Head tube length
- Source (dropdown), Source URL, Change reason

**Actions**:
- **Save draft** — patches the existing draft record
- **Approve** (geometry_manager, super_admin) — sets status to "active", records `reviewedBy` and `reviewedAt`
- **Reject** — sets status to "rejected"
- **Create new version** — creates a new draft record with version + 1, marks current as "superseded"

All actions write audit log entries.

### C5. Version history panel

On the geometry record detail page, show a collapsible "Version history" section listing all previous versions for this model/size combination (query by `modelId` + `sizeLabel`, sorted by version desc). Show version number, status, created by, reviewed by.

### C6. CSV import (geometry_manager only)

A simple import UI at `/admin/geometry/import`:
- File input: accepts `.csv`
- Required columns: `brand_slug`, `model_name`, `category`, `size_label`, `stack`, `reach`, `seat_tube_angle`, `head_tube_angle`, `wheelbase`, `chainstay`, `bb_drop`, `etop_tube`, `standover`, `fork_rake`
- Preview first 10 rows before confirming
- On confirm: calls a Convex action `importGeometryFromCsv` that:
  1. Parses the CSV rows
  2. Looks up or creates brands and models by slug/name
  3. Creates draft geometry records for each row
  4. Returns a summary: rows processed, records created, errors encountered
- All created records start as `status = "draft"` — geometry_manager must approve each one

---

## Convex additions needed

### New queries

```ts
// Admin: list all bikes (across all users)
export const listAllBikes = query({
  args: { paginationOpts, search, category, hasGeometry },
  ...
});

// Bike detail for admin
export const getAdminBikeDetail = query({
  args: { bikeId: v.id("bikes") },
  // Returns bike + owner user + fit sessions using this bike + linked geometry
  ...
});

// Rider measurement detail for admin
export const getAdminRiderData = query({
  args: { userId: v.id("users") },
  // Returns profile + measurement flags
  ...
});

// Geometry: list models for a brand
// Geometry: list records for a model
// Already defined in step 03 — verify these are complete
```

### New mutations

```ts
export const createGeometryBrand = mutation({ ... });
export const createGeometryModel = mutation({ ... });
export const createGeometryRecord = mutation({ ... });  // from step 03
export const approveGeometryRecord = mutation({ ... }); // from step 03
export const rejectGeometryRecord = mutation({ ... });
export const createGeometryRecordVersion = mutation({ ... }); // new version of existing record
export const linkBikeToGeometry = mutation({
  args: { bikeId: v.id("bikes"), recordId: v.id("geometry_records") },
  ...
});
```

### New action

```ts
export const importGeometryFromCsv = action({
  args: { csvContent: v.string() },
  handler: async (ctx, { csvContent }) => {
    // geometry_manager or super_admin only
    // Parse CSV, create draft records, return summary
  },
});
```

---

## Schema addition

Add to `bikes` table in `convex/schema.ts`:

```ts
geometryRecordId: v.optional(v.id("geometry_records")),
adminNotes: v.optional(v.string()),
```

Add to `profiles` table:

```ts
adminNotes: v.optional(v.string()),
adminFlagged: v.optional(v.boolean()),
```

---

## Acceptance criteria

- [ ] Rider data list shows users with flagged measurements
- [ ] Rider detail shows full profile, admin can add notes
- [ ] Bike list shows all bikes across all users, is filterable
- [ ] Bike detail shows owner, setup, and linked geometry
- [ ] "Link to geometry record" works end-to-end
- [ ] Geometry brand/model tree is navigable
- [ ] New brand, model, and size record forms work
- [ ] Geometry record status workflow: draft → approved (with audit log)
- [ ] Version history shows all versions for a size
- [ ] CSV import creates draft records and returns a summary
- [ ] All write operations are role-gated and write audit logs
- [ ] `npm run typecheck` passes
