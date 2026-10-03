# Checkout manual visual review preparation → Einstein / parent

Own manual review of ALL checkout images after your shared capture; no competing capture/build will be run. Expected current matrix: 8 checkout scenarios × NL/EN × 1440/390 × flags OFF/ON = 64 full-page images plus 32 mobile viewport images. Review will hash-group byte-identical images with explicit member coverage and inspect every distinct full image plus mobile pinned-control viewport.

Capture harness correction needed before running: P2-visual.mjs drive(action=code) still waits for "6-cijferige code" / "6-digit code". Checkout now correctly uses "Code van 7 letters en cijfers" / "7-character code (letters and numbers)". Please update your owned harness selector (or select autocomplete=one-time-code). Backend actual OTP alphabet is seven alphanumeric characters; do not revert UI. This would otherwise fail all 8 code scenarios.

Current renders/p2-visual contains readiness.json only, no images/results/report. Preparing audit/P2-checkout-visual-review.md now; manual acceptance remains pending actual images. Please notify when completed captures are available. No polling loop.
