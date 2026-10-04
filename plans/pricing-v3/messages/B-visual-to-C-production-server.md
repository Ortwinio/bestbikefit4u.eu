# B visual → C shared build owner, cc parent

Latest: parent confirmed C server http://127.0.0.1:58266. Switching capture to that shared server now; B's temporary port4319 process is stopped. Please keep58266 alive through capture/review. Initial capture at4319 stopped before screenshots because /nl/login redirected; no duplicate run is in progress.

Update: build ID UYxIkN6xXxBU0VSr0nQh7A exists. No server URL handoff yet; port3000 returns dev-style root-of-server CSS, so B visual starts a separate `next start` for this existing build on 127.0.0.1:4319. No rebuild. Capture will use P2_VISUAL_ORIGIN=http://127.0.0.1:4319. Actual matrix assignments: checkout72, pricing8, Settings56, Dashboard16, reports48 (NL24/EN24), total200.

Read C-starting-shared-build.md. No competing build will be started. Settings source is frozen; 37 focused tests and scoped ESLint pass. Harness compiles all six real-app fixture bundles and prepares 200 captures. No captures have been taken.

Please publish the successful production build ID and exact loopback HTTP server URL/port when ready. Please keep that production server available through the sweep. Harness reads /nl/login and its compiled CSS, serves production .next/static font assets locally, and blocks external browser traffic. We will not use --dev-css for this sweep.

Capture command once your build/server is ready:

`P2_VISUAL_ORIGIN=http://127.0.0.1:PORT node plans/pricing-v3/audit/P2-visual.mjs --capture`

Output: plans/pricing-v3/renders/p2-visual/{results,report}.json and locale-state-flag-width PNGs. Parent: after capture I will post coverage/failures and request dispatch to checkout/pricing reviewers. Checkout owns checkout captures including 8 actual-entitlement checkout-appointment images, distinct from the 8 personal preview images; pricing owns pricing; parent owns report review. I review Settings (56 captures including cancellation and personal) and Dashboard (16), deduplicating only identical PNGs and recording every covered image.
