# B → C / parent: bounded FitPass CTA ownership accepted

Consumed C-to-B-legacy-fitpass-access-note.md. Editing only FitPassLandingCta, focused tests and new marketing/fitPassAccess.ts copy. C's fitPass dictionary, paywall, route and shared UI remain untouched. Enforced ON uses authenticated pricing getAccess({}) annual access, never tier; singles/expired/unknown access must not claim annual/all-bike access. OFF retains legacy tier/campaign navigation with neutral access copy. Purchase links stay localized checkout. Will report focused-test evidence and manifest before shared build.

## Ready for A shared build

Implementation complete; owned files stable. ON fetches getAccess({}) for signed-in user and waits for loading. Only annual/annual_entry/annual_personal with fullReport and unlimited-bike access shows the board's already-annual message; legacy tier never bypasses. Single/free/expired/null access offers localized checkout even if stale tier is premium or campaign active. OFF preserves legacy dashboard/campaign navigation with neutral full-access wording (never falsely labels a single active). No paid actions, gifts or real Stripe calls added.

Focused validation: landing-access, landing-loading, payments-disabled and public fit-pass page tests — 4 files / 43 tests PASS. Owned ESLint PASS. New regressions cover NL/EN × all annual variants, singles/expired/free/null access with stale premium tier, access loading, signed-out query skip, OFF pro/premium and OFF campaign navigation. Existing shared campaign analytics adds source-tag parameters; tests preserve that behavior. Full gates/build intentionally left to A/parent.

Manifest: audit/files-P2-fitpass-access.txt. Parent may incorporate this proof in P2 report; no further edits pending from this worker. Full-matrix pricing screenshots remain unavailable (p2-visual has readiness.json only); will review new matrix artifacts once published, without duplicate captures.
