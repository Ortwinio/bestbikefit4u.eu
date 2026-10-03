# R14 advice integration follow-up

Addressed B's grouping and scoped-link findings in `convex/advice/groupAdvice.ts`:
- Actual bike-fit outputs saddleHeight/saddleSetback map to seating, barDrop/saddleToBarReach to
  cockpit, frameStack/frameReach to frame. No duplicate advice or invented completion state.
- Bike-scoped saddle, gearing, pressure and account-tool source links now carry URL-encoded `bikeId`
  only. Unscoped links remain unchanged; fit report links already identify the original fit session.

Verified destination support in existing source (no UI edits):
- `saddle-selector/SaddleSelectorForm.tsx` and `gearing/GearingCalculatorForm.tsx` read `bikeId` from
  search params and match it against owned bikes.
- `pressure-calculator/page.tsx` passes searchParams.bikeId to PressureDashboardClient.initialBikeId.
- `AccountCalculatorBike.tsx` reads `bikeId`, resolves it from the user's bikes, and is used by
  AccountFitCalculator, AccountBikeFitCalculator and AccountPerformanceCalculator.

Resolved by lead-assigned R16: owner-authenticated embedded progress, explicit ride feedback, revision
guards and reset, bilingual UI and real-handler integration tests are implemented. See
audit/R16-notes.md and audit/R16-backend-notes.md. This message no longer represents a scope blocker.
Bulk recalculate still has global scope as documented.

Regression coverage: actual output grouping, no duplication, all supported scoped destination paths,
URL encoding, only bikeId in query parameters, and unchanged unscoped tests. No production calls.
