# Output 01 — Delta Convex Endpoint Review

Date: `2026-03-18`
Plan: `plans/security-audit-2026-q1`
Step: `01-delta-convex-review.md`

## Scope

Files added or modified in commits `04b47ef` (tire pressure), `d7f66cc` (dashboard upgrade), and `dd548dd` (fit flow) since baseline `e79b451`.

New modules: `wheelsets/`, `tireSetups/`, `pressureProfiles/`, `pressureCalculations/`, `bikeProfiles/`, `rideFeedback/`, `validationCaptures/`, `integrations/`.

Modified modules: `bikes/`, `files/`, `sessions/`, `recommendations/`, `profiles/`, `users/`.

---

## 1. Endpoint Inventory

| Endpoint | Type | Auth guard | Input validation | Finding |
|---|---|---|---|---|
| `wheelsets.create` | mutation | `requireBikeOwner` | v. validators; `name` unbounded string | P2: no string length limit on `name` |
| `wheelsets.update` | mutation | `requireUserId` + ownership check | v. validators; `name` unbounded string | P2: same |
| `wheelsets.remove` | mutation | `requireUserId` + ownership check | id validator | OK |
| `wheelsets.listForBike` | query | `requireBikeOwner` | id validator | OK |
| `wheelsets.get` | query | `requireUserId` + ownership check | id validator | OK |
| `tireSetups.create` | mutation | `requireUserId` + `requireOwnedWheelset` | v. validators; `name`, `brand`, `model` unbounded | P2: no string length on free-text fields |
| `tireSetups.update` | mutation | `requireUserId` + ownership check | v. validators; same free-text fields | P2: same |
| `tireSetups.remove` | mutation | `requireUserId` + ownership check | id validator | OK |
| `tireSetups.listForWheelset` | query | `requireUserId` + ownership check | id validator | OK |
| `tireSetups.get` | query | `requireUserId` + ownership check | id validator | OK |
| `pressureProfiles.save` | mutation | `requireBikeOwner` + tireSetup ownership check | v. validators; `name`, `targetSurface`, `targetGoal` unbounded | P2: no string length on free-text fields |
| `pressureProfiles.remove` | mutation | `requireUserId` + ownership check | id validator | OK |
| `pressureProfiles.listForBike` | query | `requireBikeOwner` | id validator | OK |
| `pressureProfiles.get` | query | `requireUserId` + ownership check | id validator | OK |
| `pressureCalculations.save` | mutation | `requireUserId` + optional bike/tireSetup ownership | v. validators; `warningsJson`, `routeContextJson` unbounded strings | P2: unbounded JSON blobs |
| `pressureCalculations.listForBike` | query | `requireBikeOwner` | id + optional limit | OK |
| `pressureCalculations.listForUser` | query | `requireUserId` | optional limit | OK |
| `pressureCalculations.getLatestForBike` | query | `requireBikeOwner` | id validator | OK |
| `pressureCalculations.isBikePressureStale` | query | `requireBikeOwner` | id validator | OK |
| `bikeProfiles.create` | mutation | `requireBikeOwner` | v. validators | OK |
| `bikeProfiles.update` | mutation | `requireBikeProfileOwner` | v. validators | OK |
| `bikeProfiles.archive` | mutation | `requireBikeProfileOwner` | id validator | OK |
| `bikeProfiles.ensureDefaultForBike` | mutation | `requireBikeOwner` | v. validators | OK |
| `bikeProfiles.getById` | query | `requireBikeProfileOwner` | id validator | OK |
| `bikeProfiles.listByUser` | query | `requireUserId` | none needed | OK |
| `bikeProfiles.listByBike` | query | `requireBikeOwner` | id validator | OK |
| `bikeProfiles.getDefaultByBike` | query | `requireBikeOwner` | id validator | OK |
| `rideFeedback.submitBeta` | mutation | `requireSessionOwner` + feature flag | v. validators | OK |
| `validationCaptures.createBeta` | mutation | `requireSessionOwner` + feature flag | v. validators | OK |
| `integrations.disconnectStrava` | mutation | `requireUserId` | none needed | OK |
| `integrations.importRecentRides` | action | none (throws immediately) | none needed | OK — stub only |
| `integrations.getStravaStatus` | query | `requireUserId` | none needed | OK |
| `bikes.create` | mutation | `requireUserId` | v. validators; `name`, `brand`, `model`, `photoUrl` unbounded | P2: no length limits on text fields |
| `bikes.update` | mutation | `requireBikeOwner` | same | P2: same |
| `bikes.remove` | mutation | `requireBikeOwner` | id validator | OK |
| `bikes.getById` | query | `requireBikeOwner` | id validator | OK |
| `bikes.get` | query | `requireUserId` + ownership check | id validator | OK |
| `bikes.listByUser` / `list` | query | `requireUserId` | none | OK |
| `bikes.getCurrentBike` | query | `requireUserId` | none | OK |
| `files.generateUploadUrl` | mutation | `requireUserId` | none needed | OK |
| `files.getUrl` | query | **NONE** | `v.string()` storageId | P2: no auth — any caller with a storageId gets its URL |
| `files.deleteFile` | mutation | `requireUserId` | `v.string()` storageId | OK |
| `sessions.create` | mutation | `getAuthUserId` check | v. validators | OK |
| `sessions.updateStatus` | mutation | `requireSessionOwner` | v. union literal | OK |
| `sessions.addPainPoints` | mutation | `requireSessionOwner` | v. validators + `validateShortString` | OK |
| `sessions.updateRidingDetails` | mutation | `requireSessionOwner` | `validateNumberRange` bounds | OK |
| `recommendations.generateFromData` | internalAction | internal (not callable externally) | v. validators | OK |
| `recommendations.runShadowComparison` | internalAction | internal | v. validators | OK |
| `users.updateProfile` | mutation | `requireUserId` | v. validators; `profile_image_url` unbounded string | P2: no URL validation on `profile_image_url` |
| `users.deleteAccount` | mutation | `requireUserId` | none needed | OK |

---

## 2. Detailed Findings

### P2-01 — `files.getUrl`: No Authentication

**File:** `convex/files/actions.ts` (lines 14–19)

The `getUrl` query accepts a `storageId` string and returns the Convex storage URL without any authentication check. An unauthenticated caller who knows or guesses a valid storageId can retrieve the file URL.

**Risk:** Low-medium. Convex storage IDs are non-enumerable opaque identifiers, so brute-force guessing is impractical. However, the design violates the principle of least privilege — unauthenticated access to any storage URL is unintended.

**Recommended fix:** Add `requireUserId(ctx)` at the start of the handler. If anonymous access to public assets is needed, that should be an explicit, documented decision.

### P2-02 — Unbounded `v.string()` Inputs on New Endpoints

**Files:** `convex/wheelsets/mutations.ts`, `convex/tireSetups/mutations.ts`, `convex/pressureProfiles/mutations.ts`, `convex/pressureCalculations/mutations.ts`, `convex/bikes/mutations.ts`, `convex/users/mutations.ts`

Several new mutations accept free-text strings (`name`, `brand`, `model`, `targetSurface`, `targetGoal`, `warningsJson`, `routeContextJson`, `profile_image_url`) without length constraints. An authenticated user can write arbitrarily large strings to the database.

**Notable:** `warningsJson` and `routeContextJson` in `pressureCalculations.save` are JSON blobs with no size cap. These are written server-side in the pressure calculation flow but the args are fully caller-controlled.

**Risk:** Low (requires authentication; Convex has document size limits as a backstop). However it's inconsistent with the established pattern of `validateShortString`/`validateTextString` used in `sessions` and `profiles`.

**Recommended fix:** Apply `validateShortString` to name/brand/model fields (max ~100 chars) and `validateTextString` to description fields. For `warningsJson`/`routeContextJson`, either impose a character limit or make these internal-only fields populated by server-side logic rather than client args.

### P2-03 — `users.updateProfile`: `profile_image_url` Unbounded, No URL Validation

**File:** `convex/users/mutations.ts` (line 7)

`profile_image_url` is `v.optional(v.string())` with no length limit and no URL format check. An authenticated user can write an arbitrary string to the users table's `profile_image_url` column.

**Risk:** Low (stored only; the app renders the image via Next.js `<Image>` or `<img>` so XSS from a URL stored in DB depends on rendering context). Should be constrained to a reasonable length and ideally validated as a Convex storage ID or https URL.

---

## 3. HTTP Actions and SSRF Check

`convex/http.ts` only registers auth routes — no custom HTTP actions added by new features.

`convex/integrations/actions.ts` `importRecentRides` is a stub that immediately throws; it does not make any external HTTP calls. No SSRF risk.

`recommendations/actions.ts` uses only `internalAction` (not callable from client) and makes no external HTTP calls.

**Result: No SSRF risk in new code.**

---

## 4. Data Isolation Check

All new mutations correctly scope writes to the authenticated user:
- Bike-scoped resources (wheelsets, tireSetups, pressureProfiles, pressureCalculations) use `requireBikeOwner` / `requireOwnedWheelset` which verify the authenticated user owns the parent resource before allowing writes.
- Cross-resource validation (e.g. `pressureProfiles.save` verifies both `bikeId` ownership and `tireSetupId` ownership before inserting) is correct.
- `deactivateSiblingWheelsets` and `deactivateSiblingTireSetups` helper functions do not check ownership independently — they operate on records fetched via an index on a parent ID that was already ownership-verified by the calling mutation. This is safe.

---

## 5. Summary

| Severity | Count | Items |
|---|---|---|
| P0 | 0 | — |
| P1 | 0 | — |
| P2 | 3 | Missing auth on `files.getUrl`; unbounded string inputs on new mutations; no URL validation on `profile_image_url` |
| P3 | 0 | — |

No P0 findings. No missing auth on any mutation. No SSRF. No cross-user data leakage.
