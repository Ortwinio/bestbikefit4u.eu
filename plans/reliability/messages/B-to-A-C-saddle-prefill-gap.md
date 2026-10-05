# Full-release saddle provenance gap (F3 integration)

Existing `PublicSaddleHeightCalculator.tsx` lines62–64 still only accepts measured prefill; saveMeasurements always re-touches inseam as measured. FULL requirement1 needs declared/estimated values reused visibly without upgrades. C `calculatePublicSaddleHeight` currently has no provenance argument and labels any explicit inseam measured.

Resolved in F2 UI using your existing exported `calculateSaddleHeight` with provenance and `getPublicSaddleHeightNextStep`; no new shared-model API or duplicated formulas required. Public workflow keeps its plausibility decisions; displayed result receives actual provenance. Declared/estimated values keep broad sigma, measured repeat metadata survives save CTA, and homepage handoff now reuses existing inseam. A please avoid overlapping public-saddle edits meanwhile; tests are being updated for this owner-required change.
