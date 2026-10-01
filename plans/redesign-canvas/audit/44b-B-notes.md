# 44b-B — Twelve bilingual guide rewrites

## Scope and ownership

All twelve Batch B slugs are preserved. Dutch was written first; English follows
the same structure and practical advice. Content lives in
`src/lib/guides/content/batch-b/`, exported as `batchBGuides` using C's GuideRewrite
contract. B's title dictionary supplies the exact Dutch and English guide titles.
C owns the shared registry, renderer, title integration and audit; B did not edit them.

Four authorized subagents wrote disjoint groups of eleven guides. B wrote the foot
guide, reviewed the copy, drew all twelve illustrations, prepared CMS artifacts and
owns final checks. Review removed generic saddle-lowering suggestions from the
performance guides in favor of relevant control and measurement-repeatability checks.
The low-back guide explicitly distinguishes urgent neurological warning signs.

## Editorial checks

- Each language has a 40–70-word answer, five ordered article sections, numbered
  steps, four FAQs, and a separate one-sentence CTA. Required block lengths and the
  900–1500-word total are enforced by tests and the shared rendered-page audit.
- Metadata: unique keyword-led titles of at most 60 characters; descriptions
  140–155 characters; keyword in H1, opening and an H2. No slug changes.
- Each guide links to 3–4 other B guides, with exact final localized title anchors,
  plus a relevant calculator. Every guide has at least two inbound links within
  this batch, independently of other batches or navigation links.
- The proposed setup-parameters keyword `fiets afstellen maten` is shortened to
  `fiets afstellen` for natural Dutch: H1 `Fiets afstellen: maten vastleggen`.
  Other proposed primary keywords are retained; proposals are not search-volume claims.
- Medical copy names symptoms, not diagnoses. No guaranteed pain relief, performance
  gains, recommended FTP test effort or universal ideal joint angles are invented.

## Claim and number provenance

- Conservative 2–5 mm examples, one change at a time, two to three easy trial rides
  and the three-to-four-adjustment escalation rule come from the supplied writing guide.
  Examples are explicitly conditional, not universal settings or treatments. Safe
  component limits and manufacturer torque instructions take precedence.
- Foot guide: 2–3 mm rearward cleat example also appears in the supplied 44a live
  audit's original foot-guide FAQ/body. It is labeled an illustrative trial to
  discuss, not a diagnosis or mandatory correction.
- Persistent/recurrent tingling guidance: [NHS pins and needles](https://www.nhs.uk/symptoms/pins-and-needles/).
  Urgent low-back red flags: [NHS back pain](https://www.nhs.uk/conditions/back-pain/).
  Both are linked in the relevant guide and were read during editorial review.
- FTP factors 0.95 and 0.75, known-value behavior, W/kg, climb-distance bands and
  model limitations are checked against `src/lib/public-calculators/performance.ts`.
  The 200 W → 190 W example is arithmetic under that model, not a physiological promise.
- Power, speed and gearing explanations follow `src/lib/gearing-engine/math.ts`
  and the performance wrapper: steady-state assumptions, fixed resistance defaults,
  no separate wind input and no personal aerodynamic measurement.
- Contact-point measurement distinctions follow the local fit-engine coordinate
  contract. Guides do not invent a universal saddle target or a measured medical cause.

## New illustrations

Update 44b-B.1: rider figures were redrawn after lead review using bike-anchored IK.
See `44b-B.1-notes.md` and `44b-B.1-geometry.json`; individual full-size and 390px
hero previews supersede the original illustration review below.

Read the full bestbikefit4u-illustraties skill and used route B, no web photos or
AI image generation. `scripts/guides-batch-b/draw.py` reuses the skill's existing,
unmodified Pen/Fiets engines from C's scripts. Those engines must ship with C's batch.
Only the six house colors are used; no visible text is embedded. Each hero is
1600×1000 WebP under 200,000 bytes, with editable SVG and local PNG review files.
NL/EN alt text describes the actual topic. Dimensions and sizes are asserted in tests.

| Slug | Illustration |
| --- | --- |
| bike-fit-for-foot-pain-hot-foot-and-numb-toes | 21-gevoelloze-tenen |
| bike-fit-for-riders-with-limited-flexibility | 22-beperkte-flexibiliteit |
| bike-fitting-for-lower-back-pain | 23-lage-rugpijn |
| climb-time-and-event-pacing-guide | 24-klimtijd |
| endurance-bike-fit-guide | 25-lange-ritten |
| ftp-explained | 26-ftp-meten |
| how-to-compare-two-bikes-for-fit | 27-fietsen-vergelijken |
| mountain-bike-fit-guide | 28-mountainbike-afstellen |
| power-to-speed-guide | 29-vermogen-snelheid |
| road-bike-fit-guide | 30-racefiets-afstellen |
| setup-parameters | 31-afstelmaten |
| triathlon-bike-fit-guide | 32-triatlonhouding |

The PNG contact sheet was visually reviewed; rider headroom, trainer occlusion and
dimension-line readability were corrected. Illustrations are explanatory, not
personal prescriptions or dimensionally exact fitting diagrams.

Reproduce: `DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib /private/tmp/bbf44c-illustrations-env/bin/python scripts/guides-batch-b/draw.py`.
The local environment contains CairoSVG/Pillow; no dependency or package change was needed.

## CMS handoff

`node scripts/guides-batch-b/export.mjs` writes twelve CMS-schema JSON documents to
`plans/redesign-canvas/guides-import/<slug>.json` and the B title dictionary.
Records are `in_review`, with `importStatus: 44b`, complete bilingual markdown,
structured sections, FAQs, descriptions, image/OG fields and modification date.
Tests compare exported copy, FAQ and assets against the editorial source.

No Convex client is created by the exporter. No database writes, publishing,
git commit, push or deployment were performed. Production publishing needs separate
approval and C's import support for all image/alt fields; these files are review artifacts.

## Validation

Final validation on 1 October 2026:

- Focused Vitest: 54 tests across B content, shared registry and renderer passed.
  Command: `npx vitest run src/lib/guides/content/batch-b/content.test.ts src/lib/guides/rewrites.test.ts src/components/guides/RewrittenGuide.test.tsx --maxWorkers=2`.
- `npm run typecheck` and `npm run seo:validate-sitemaps` passed.
- Final whole-tree `npm run lint` passed after A resolved its concurrent test lint error.
  B-owned TypeScript/exporter ESLint passed. Runtime boundaries, tooltip coverage,
  all 254 contrast checks and CSS-module token checks passed.
- The isolated production build passed; final snapshot is
  `/tmp/bbf-final-sweep-81034b76749881af`. Build identity is recorded in `44b-B-browser.json`.
- Shared 44a audit rerun with B's twelve-slug filter: all checks passed for all
  24 NL/EN articles. Evidence: `44b-B-audit.json`.
- Production browser captures: 48/48 passed (12 guides × NL/EN × 1440/390).
  All returned 200, used the code rewrite, had no horizontal overflow and no page errors.
  Evidence: `44b-B-browser.json`; PNGs and build log in `code-renders/44b-B/`.
  Reproduction wrapper: `/private/tmp/44b-B-capture.mjs` using C's `runGuideAudit`
  and `prepareProduction`; no shared harness changes.
- Visual review covered the twelve-hero contact sheet and desktop/mobile article
  captures. Final review included EN setup measurements and NL FTP.
- Two first-pass audit findings were fixed: split the English FTP example paragraph
  (decimal punctuation counted as an extra sentence), and replace Dutch `professional`
  with `zorgverlener`. CMS artifacts were regenerated before the final run.
- `git diff --check` passed; all 60 manifest entries exist and are unique.

Exact owned file manifest: `audit/files-44b-B.txt`. Shared C integration is excluded.
