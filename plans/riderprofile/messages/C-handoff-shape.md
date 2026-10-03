# C → B: bbf.handoff v1 contract (R1)

sessionStorage key: `bbf.handoff`. No localStorage, URL values, analytics values, logs or emails.

```ts
type HandoffMethod = "measured" | "estimated" | "declared" | "bike";
type HandoffCalculator = "bike-fit" | "saddle-height" | "frame-size" | "crank-length"
  | "saddle-width" | "tire-pressure" | "gearing" | "power-speed" | "climb-planner"
  | "ftp-wkg" | "fuel-hydration";
interface HandoffEntry {
  field: HandoffField;
  value: number | string;
  unit: "cm" | "mm" | "kg" | "W" | "teeth" | "score" | "none";
  calculator: HandoffCalculator;
  method: HandoffMethod;
  touchedAt: number; // epoch ms; actual edit/explicit confirmation, never render/prefill time
}
interface HandoffRecord { version: 1; entries: HandoffEntry[] }
```

Fields (unit):
- rider: heightCm(cm), inseamCm(cm), flexibilityScore(score), coreStabilityScore(score),
  ridingGoal(none), weightKg(kg), ftpWatts(W), ftpMethod(none), sitBoneWidthMm(mm), sweatProfile(none).
- bike: bikeCategory(none), currentSaddleHeightMm(mm), currentCrankLengthMm(mm),
  currentSaddleWidthMm(mm), currentSaddleModel(none), tireWidthFrontMm(mm), tireWidthRearMm(mm),
  rimType(none), surface(none), outerChainringTeeth(teeth), innerChainringTeeth(teeth),
  cassetteSmallestCogTeeth(teeth), cassetteLargestCogTeeth(teeth).

Canonical enum values use existing calculator values; B validates/maps to profile bounds and enums.
Method is the provenance category. Inseam/sit-bone measurement choice updates that entry's method.
Unqualified user-entered measurements use declared (UI: method unknown), never assumed measured.
Bike component/setting inputs use bike. Goals, categories and self-rated scores use declared.
FTP's explicit protocol is carried as ftpMethod only when selected; no invented default protocol.

Latest explicitly touched value wins per field in this same-tab session; no history is needed here.
At most 32 entries, strings at most 120 characters, serialized UTF-8 record at most 16,384 bytes.
Reject unknown version, malformed/oversized records, invalid fields/units/methods/calculators,
non-finite numeric values and invalid timestamps. Safe no-op if sessionStorage is unavailable.
No expiry beyond browser session; B treats all data as untrusted and revalidates on import.

C exports types + HANDOFF_KEY + readHandoff(), writeHandoffEntry(), clearHandoff() from
src/lib/handoff/store.ts. readHandoff returns an empty v1 record on unusable storage.
Prefill uses stored values only for supported compatible inputs; preserves method/calculator/touchedAt
and never writes a new entry or marks unrelated fields touched. Account mode must never use this store.
B owns clearing after confirm/cancel and server import/conflict handling.
CTA is localized /login?src=<calculator>&handoff=1 only. No values in any URL.
