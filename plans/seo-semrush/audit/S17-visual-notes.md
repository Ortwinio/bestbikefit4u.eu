# S17 visual evidence — complete

## Status

Capture, automated comparison and manual review complete. The visual worker inspected 24 changed fullpages; the parent completed the remaining 21 after the bounded handoff. No application changes were needed. S15 evidence remains untouched.

## Capture and automated checks

- Final build: `F-yLf373Lqu2IKKHBS4al`; S15 reference build: `rejwcKGnhSNUclqs6ffwl`.
- All 84 cases captured: 21 routes at NL/EN and 1440/390 widths. Matrix includes home, all 11 calculators, guide, contact, FAQ, author, methods, three pressure landings, and bikefitting; home/bikefitting also have footer crops.
- All 84 HTTP 200; zero recorded document overflow, runtime errors, console errors, failed assets, broken images, blocked nonlocal requests, or axe violations. This is not a claim of complete accessibility conformance.
- All 44 calculator cases have exactly one `integration.personalize` block and one `integration.answers` entry, with localized `/login?src=tool&handoff=1` links. Default untouched state captured; no signup or end-to-end account persistence exercised.
- Local-only signed-out preview uses actual built CSS/fonts/images. No production data, mail, or external requests. No baseline rebuild.
- Capture JSON SHA256: `eb06e4c6c4f327fab2b517b78711a4ba568bce5f4e69c88e4e41dfaea2954958`.

## Hash comparison and exact manual coverage

- 39/84 fullpage PNGs are byte-identical to previously reviewed final S15 evidence; reuse that review rather than claiming a new inspection.
- 45 changed PNGs: all 44 calculator cases, plus `bikefitting` NL390 (zero height delta). Per-case hashes and height deltas are saved in `S17-visual-comparison.json`.
- **24 changed fullpages manually inspected completely:** bike-fit, saddle-height, frame-size, crank-length, saddle-width, gearing; each NL1440, NL390, EN1440, EN390. Complete sequential strip sheets were inspected, not only first viewports. Mobile strips use native 390px width; desktop strips use 720px width. White unused sheet cells are not page whitespace.
- **20 additional calculator fullpages inspected by the parent:** power-speed, climb-planner, ftp-wkg, fuel-hydration, tire-pressure; each NL1440, NL390, EN1440, EN390.
- **One additional changed fullpage inspected by the parent:** bikefitting NL390. Minor outline-CTA text/width rendering variation, no height change, clipping or lost sections; no new blocking visual finding.
- All 45 changed fullpages now have complete sequential-strip review. Together with the 39 identical previously reviewed images, all 84 cases are covered. Review sheets remain under `/private/tmp/S17-visual-review/after/`.

## Findings in inspected coverage

- No new blocking visual defect observed in the 45 inspected changed fullpages. Rider-profile personalization and SEO short-answer/worked-example sections coexist, without clipping or lost footer/FAQ content.
- Intentional main changes include dark/lime personalization cards, measurement provenance/confirmation controls, sticky mobile result controls, and replacement/removal of selected older CTAs. Corresponding increased heights are not alone regressions. Empty carry-forward cards truthfully show no user-entered values in these untouched defaults.
- Existing NL390 long footer calculator labels still wrap mid-word without document overflow. EN390 crank-length's narrow recommended label also splits within its card. These are retained presentation limitations, not fixed here.
- No remaining manual-review or technical capture blocker. Authenticated persistence and live CMS content are outside this signed-out offline capture; six S10 LCP follow-ups remain open.

## Harness and verification

- `S17-visual.mjs after` guards the authorized build ID and saves 84 screenshots/metrics; `S17-visual-server.mjs` serves the local built preview.
- `S17-visual-review.mjs after` prepares fullpage strip sheets; `S17-visual-compare.mjs` compares immutable S15 images and refreshes the exact S17-only manifest.
- Scoped ESLint on all four `S17-visual*.mjs` files passed. Parent owns full gates; no repeat build or full gate run by this worker.
- Exact saved file list: `S17-visual-manifest.txt`. No copied app sources or bundles added to this evidence.
