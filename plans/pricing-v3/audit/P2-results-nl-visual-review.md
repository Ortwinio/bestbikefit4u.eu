# NL results visual review — PASS

## Final v3 verification

Build6KW82hm49ljNYI1ddtwmm: all36 NL result PNGs are byte-identical to the reviewed v2 files.
Parent compared every hash against v2-screenshot-hashes.json; no unreviewed delta. Manifest build/provenance
updated. Final200 capture passes including fixed-CTA bounds. Compiled production CSS was read from the same
build's disk manifest; repaired local HTTP CSS is byte-identical (P2-css-provenance.json). No dev CSS.

## Final v2 acceptance

Build **0Dw9Uq506jBKvW5c7Uwwh**, production CSS from http://127.0.0.1:60620. All24 NL full-page
results cases plus12 mobile viewport images are covered. Exact filenames, final SHA-256 and initial-run
comparison are in P2-results-nl-visual-manifest.json. The final shared capture is200/200 with no failures.

Manually reviewed every changed unique full image: paid/off, single/off, paid/on, single/on, other-bike/on,
free-older/on at1440 and free-older/on at390. Other-bike/off matches single/off byte-for-byte. All remaining
full-page and all12 viewport images match previously reviewed hashes. Final full-page grouping has17
unique images for24 cases; unchanged initial evidence below remains applicable.

The older-free action now fits the390px card, with a compact disabled button and readable wrapping latest-only
note. Desktop also fits. Sidebar correctly says Jaarabonnement or Losse meting for actual entitlements,
including enforcement OFF; free/legacy-only accounts retain Gratis. Longer plan labels wrap without
overlapping the session count. Existing scrollable sidebar navigation accommodates the plan card height.
No remaining NL report visual blocker. Server/PDF permissions are covered separately by tests, not images.

## Initial review and remediation history

Initial build: UYxIkN6xXxBU0VSr0nQh7, production CSS from loopback58410. All24 NL report full-page
images reviewed via14 unique SHA-256 groups produced by P2-report-review.mjs. Mobile strips keep their
native390px width; desktop overviews use720px width. White trailing atlas space is not page whitespace.
These are actual-app fixtures with synthetic auth/data, not live backend or PDF-generation evidence.
All12 mobile viewport files are covered by5 unique reviewed images: free/off (five identical states),
free/on (also older-free/on), legacy/off, legacy/on, paid/on (also single/on and other-bike/on).

## Coverage

Each row below covers both1440 and390 widths; filenames are `nl-results-{state}-{flag}-{width}.png`.

| Representative state/flag | Byte-identical covered state/flag images, per width |
| --- | --- |
| free/off | paid/off, single/off, other-bike/off, free-older/off |
| legacy/off | none |
| free/on | none |
| paid/on | single/on |
| legacy/on | none |
| other-bike/on | none |
| free-older/on | none |

## Findings

- Four core values, bike diagram, report actions, safety advice and localized accuracy labels are readable.
  Full-access current/target comparison is visible; free/other-bike upgrade panels remain distinct.
- Legacy full-access banner remains explicit under both flag values. Free latest PDF uses core-values copy.
  Older free report cannot download; email action explains the access restriction rather than opening/sending.
- Lime/ink/petrol surfaces, pills, spacing and mono values remain legible; stacked mobile rows fit their cards.
  Bottom navigation occupies the viewport edge; final page padding leaves trailing actions reachable.
- **Fixed and visually verified in v2:** the older-free disabled PDF button contained a full sentence and
  overflowed mobile in both languages. B replaced it with a compact PDF label and wrapping describedby note.
  Focused results suite passes26 tests, including the new bilingual regression.
- **Fixed and visually verified in v2:** AccountPlan used legacy user.tier, showing Gratis for an annual
  entitlement. The account worker now uses authoritative product labels; focused regression tests pass.

The final v2 acceptance above supersedes the initial remediation-pending state.
