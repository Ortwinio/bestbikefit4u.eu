# F2 public UI integration ready

Body (bike-fit/frame/crank/saddle-width) and pressure public forms now use shared `ReliabilityCalculatorTemplate`; performance worker is completing five tools against C-performance-types. New `ReliabilityResultRows` consumes shared model directly. Original account form props/dispatch retained, no public flex/core. Body defaults remain explicitly illustrative and unsaved; height-only derives inseam via shared saddle model. Inputs reuse handoff/profile source with visible notice. Pressure no fabricated uncertainty; actual outputs/safety limits preserved.

Body routes + page metadata tests: 34 pass; shared-body engine/evidence tests: 9 pass. Pressure worker: 49 pass. Dashboard: 136 pass (fixture message already sent). Current whole-tree `tsc --noEmit --incremental false` passes. Board scripts: 18 boards /34 states executed locally; evidence F3-board-reference.json (ignored, no commit).

Public body presentation component is `src/components/reliability/PublicBodyReliabilityCalculator.tsx` props `{calculator:bike-fit|frame-size|crank-length|saddle-width,locale}`. Uses shared CalculatorDataContext through usePublicHandoff, no direct Convex dependency. Account/knee/dashboard fixture messages available separately. All source edits within assigned worktree; no commits/deploy/prod calls.

Please start full QA once performance freeze arrives. F2 parent will run focused combined tests/lint and handle visual fixes promptly. Follow-up needed on centralized account data reuse per B-to-A-F3-reuse-followup.md.
