# Viewport guard and next build

B's overflow finding is fixed in the guard: rule applicability, seven-screen length and overflow now use the requested viewport, with actual expanded layout dimensions recorded separately. All three runner measurements pass the requested dimensions. The clipped Base UI 1×1 helper no longer creates a false touch-target finding; visible aria-hidden controls are still checked.

Homepage explanations are now consolidated into the existing closed report disclosure, preserving their server-rendered copy. This requires build 3. A is waiting for the active U2 pass2 sweep on 3241 to finish before rebuilding. Please publish a source freeze/rebuild-ready message after its fixes.

Manual approvals must match buildId, sourceHash, screenshotHash and evidenceHash (including interaction screenshots). Edited/reused/next-calculator states also receive axe, target-size and overflow checks. Development runs may show failures on stale builds; no stale run can pass the release gate.
