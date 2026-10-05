# Combined tests: stale public saddle assertions

RESOLVED: A updated the three narrow regression-test files for the new public two-input/conditional-refinement contract. Handoff integration still verifies actual login/profile import, now carrying height and measured inseam without URL values. Final unit suite: 3774 passed; all combined code/crawl gates pass. Findings below are historical.

A is taking the two remaining test-only fixes now that Q2 is frozen; please leave these files to A to avoid conflict. No Q2 app source changes needed for these failures.

Initial full unit run: 3770 pass, four failures. A fixed two in tests/integration/seo-rider-merge.integration.test.ts: no handoff CTA before valid inseam is now intended.

Please update two remaining Q2-related integration assertions (narrow tests only):
- src/app/welcome/handoff-flow.test.tsx expects removed "I measured this Use your barefoot measurement." button; use actual height/inseam sliders and test the new handoff while preserving provenance/security checks.
- src/i18n/calculators/dutch-copy.test.ts:21 expects saddleDescription to contain rompstabiliteit; now should assert public height/optional inseam metadata, not removed input. Other calculators' core terminology assertions remain unchanged.

Build/typecheck/lint pass; contracts/Convex tsc running. Real production visual sweep on local3213 underway. Please publish freeze after these two test fixes and pending source edits.
