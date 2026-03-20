# Output 02 — Test Coverage Check

**Date:** 2026-03-18

---

## Test Suite Inventory

### Test Files Found

**`src/components/ui/` (new, from Prototyper UI migration):**
- `src/components/ui/primitives.test.tsx`
- `src/components/ui/Tooltip.test.tsx`

**Tire pressure module:**
- `src/lib/__tests__/pressure-engine.test.ts`
- `convex/lib/__tests__/pressureFitInteraction.test.ts`
- `convex/lib/__tests__/pressureStaleness.test.ts`

**Dashboard/engine upgrade:**
- `convex/bikeProfiles/__tests__/mutations.contract.test.ts`
- `convex/recommendations/__tests__/refinement.test.ts`
- `convex/recommendations/__tests__/seedEngine.test.ts`
- `convex/recommendations/__tests__/shadowMode.test.ts`
- `convex/recommendations/__tests__/queries.shadow.contract.test.ts`
- `convex/recommendations/__tests__/internalMutations.contract.test.ts`
- `convex/rideFeedback/__tests__/mutations.contract.test.ts`
- `convex/validationCaptures/__tests__/mutations.contract.test.ts`

**Pre-existing (stable features):**
- `convex/lib/fitAlgorithm/__tests__/` (5 test files)
- `convex/recommendations/__tests__/generate.*.test.ts`
- `convex/questionnaire/__tests__/`
- `convex/sessions/__tests__/`
- `convex/emails/__tests__/`
- `src/i18n/*.test.ts` (4 files)
- `src/lib/reports/` (2 test files)
- `src/content/homeQuotes.test.ts`
- `src/app/api/reports/[sessionId]/pdf/route.test.ts`

---

## Coverage by Feature Area

### Tire Pressure Module

**`src/lib/__tests__/pressure-engine.test.ts`** — PRESENT, covers critical path

Tests present:
1. Reference road setup calculation (basic pressure, front/rear bar and PSI)
2. Rear pressure always >= front pressure invariant
3. Advanced corrections (gravel, wet, extra luggage, elevation, rim width, current pressure)
4. Warning generation: hookless limit exceeded, max rim pressure, unusual road tire width
5. Input validation: body weight, tire width, bike weight, current pressure ranges

Coverage assessment: **Good.** The four main exported functions (`calculateBasicPressure`, `calculateAdvancedPressure`, `validatePressureInput`) are exercised with representative inputs. Warning codes are tested explicitly.

**`convex/lib/__tests__/pressureFitInteraction.test.ts`** — PRESENT (Convex layer)
**`convex/lib/__tests__/pressureStaleness.test.ts`** — PRESENT (Convex layer)

No UI-layer test for pressure wizard (`PressureWizard.tsx`, `StepBikeSelect.tsx`, etc.) — but these are presentational React components with Convex query/mutation dependencies, making unit testing impractical without a test harness. Acceptable gap.

**Assessment: P1 gap addressed** — core calculation logic is well tested.

---

### Dashboard Upgrade (Bike Profiles, Recommendations, Ride Feedback)

**`convex/bikeProfiles/__tests__/mutations.contract.test.ts`** — PRESENT
**`convex/recommendations/__tests__/refinement.test.ts`** — PRESENT
**`convex/recommendations/__tests__/seedEngine.test.ts`** — PRESENT
**`convex/recommendations/__tests__/shadowMode.test.ts`** — PRESENT
**`convex/rideFeedback/__tests__/mutations.contract.test.ts`** — PRESENT
**`convex/validationCaptures/__tests__/mutations.contract.test.ts`** — PRESENT

No React component tests for dashboard UI components (`BikeForm.tsx`, `BikePressureSection.tsx`, `BikePressureSummary.tsx`, etc.). These are page-level components dependent on Convex — same limitation as pressure wizard.

**Assessment: Backend logic tested; UI components untested (acceptable for this stack).**

---

### GTM Consent Gate

**No test file found.** `src/components/analytics/GTMConsentLoader.tsx` has no corresponding test.

The component uses `useSyncExternalStore` + a `useEffect` that injects a `<script>` tag. A unit test could verify:
1. Script is NOT injected when `consent` is `null` or `"rejected"`
2. Script IS injected when `consent === "accepted"`
3. Script is not injected twice (`__bfGtmLoaded` guard)

**Priority: P1** — GTM consent gating is a regulatory/GDPR boundary. Missing test means the guard behavior is unverified programmatically.

---

## UI Primitive Component Coverage (`src/components/ui/`)

### `primitives.test.tsx`

Covers:
- `Button` — loading state renders disabled ✓
- `Select` — label + tooltip wiring, aria-label, placeholder ✓
- `LoadingState` — label text, progressbar role ✓
- `ErrorState` — role="alert", description text ✓
- `Progress` — progressbar role, aria-label ✓

**Not covered:**
- `Card` — no smoke test (renders without crashing)
- `Input` — no smoke test (covered partially in Tooltip.test.tsx)
- `FieldLabel` — no standalone smoke test (tested indirectly via Input/Select)
- `AccessibleDialog` — no test at all
- `EmptyState` — no test

### `Tooltip.test.tsx`

Covers:
- Trigger renders with correct aria-label and aria-describedby ✓
- Screen reader description text present ✓
- `Input` with tooltip: aria-describedby chain validated ✓ (the input's describedby contains the tooltip's description id)
- `getNextTooltipOpenState` pure function logic (focus opens, escape closes) ✓

**Assessment: Tooltip tests are thorough and test both the accessible markup and the state machine logic.**

---

## Coverage Gaps Summary

| Module | Gap | Priority |
|--------|-----|----------|
| `GTMConsentLoader.tsx` | No test for consent gate behavior | P1 |
| `AccessibleDialog.tsx` | No smoke test (renders, closes on X) | P1 |
| `Card.tsx` | No smoke test | P2 |
| `EmptyState` | No smoke test | P2 |
| `FieldLabel.tsx` | No standalone smoke test | P2 |
| Dashboard UI components (`BikeForm`, `BikePressureSection`, etc.) | No component tests | P2 (Convex dep makes unit testing impractical) |
| Pressure wizard UI (`PressureWizard`, `StepBikeSelect`, etc.) | No component tests | P2 (same reason) |

---

## Test Run

`npm test` runs `vitest run` which executes all `.test.ts` and `.test.tsx` files.

The test command requires Bash execution permissions to capture output. Based on the build passing and TypeScript passing with exit code 0, and reviewing all test files, no structural issues were found that would cause test failures. See Step 04 for the full gate run result.

---

## Recommendations

**P1 fix (Step 05):** Add smoke test for `AccessibleDialog` in `primitives.test.tsx`.

**P1 fix (Step 05):** Add test for `GTMConsentLoader` consent gate behavior.

**P2 backlog:** Add `Card` and `EmptyState` smoke tests to `primitives.test.tsx`.
