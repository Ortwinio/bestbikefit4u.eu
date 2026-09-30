# 25d — Sweep harness and hydration triage

See [25-sweep-fixes.md](../25-sweep-fixes.md), section
“25d — Items 1–3: harness fixes and hydration triage (2026-09-30)”, for findings, ownership and sweep evidence.

## 25d.1 — Lint follow-up

Confirmed the reproduction script uses `serverModule` throughout; the earlier `module` variable is already renamed.
Full `npm run lint` passes, including 254/254 brand contrast checks and CSS module token validation.
`node --test tests/visual/final-sweep/assets.test.mjs tests/visual/final-sweep/diagnostics.test.mjs`
passes all 3 tests (0 failures).

No shared UI changes, commits or pushes. The Slider correction remains with its assigned owner.

## 25f — Snapshot test fixtures

Added `tests/fixtures` to the shared production copy/fingerprint input list. Source imports outside `src`
currently use `convex`, `shared` and `tests/fixtures`; all are now included before Next's TypeScript check.
Fixture changes invalidate cached snapshots. Visual tooling still refreshes separately after the build.
Updated the harness README and added a regression test for copied fixture bytes and cache invalidation.

Validation: all 8 harness unit tests pass; ESLint on the two changed JavaScript files and diff checks pass.
A fresh isolated production build completed, including TypeScript, without manual fixture copying:

- Snapshot: `/tmp/bbf-final-sweep-0ac319e9375f372f`; `reused: false`.
- Source hash: `0ac319e9375f372f14dd57d593487cea8d58da3e428159e6ac8817b8b23ded98`.
- Build ID: `kbGnaNbIe73XgWF1kgesj`.
- Build log: `/tmp/bbf-25f-build-proof/build.log`.

The first sandbox attempt failed on Google Fonts DNS; the network-enabled retry above passed.
The validation server on port 4351 was closed after startup verification. No full sweep was started;
waiting for the lead's instruction after C completes 26.1. No app changes, commits or pushes.
