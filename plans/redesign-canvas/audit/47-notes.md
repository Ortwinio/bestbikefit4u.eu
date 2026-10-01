# 47 — Image weight: complete

All six steps completed. No commit, push, deployment or database writes by C.
The lead's checkpoint 465dd69 included some in-progress step-1 source/archive changes; the file manifest
covers the whole task, including those files. Other agents' work was preserved.

## Public weight

| Scope | Before | After |
| --- | ---: | ---: |
| Entire public directory | 201,719,319 bytes (201.72 MB) | 18,966,329 bytes (18.97 MB) |
| Guide SVG sources served publicly | 70,728,302 bytes | 0 bytes |

Reduction: 182,752,990 bytes / 90.6%. Measurements include the two retained home videos and the 80 new social JPEGs.
Exact inventories: 47-before.json, 47-after.json. Per-source compression evidence: 47-optimized.json.

## 1. Editable sources and clean-checkout tests

Moved all 48 guide SVGs to plans/redesign-canvas/illustration-sources/guides, outside public and gitignored.
All four drawing scripts archive their generated SVGs there automatically. Their editable Python source remains in git.
A/B/D tests had acquired SVG dependencies; all now use a small committed illustration-sources.json provenance record,
including raster SHA-256 and checks for no SVG text or embedded image elements. Tests run without archived originals.
The image guard also rejects any guide SVG accidentally returned to public, regardless of its size.
No large guide SVG is tracked. Existing rider-geometry checks remain available in the generator test suites.

## 2. Social previews

Generated dedicated JPEGs with contain fitting and paper padding, preserving the whole hero without clipping.
Every output is exactly 1200×630 and under 200,000 bytes. JPEG is used for platform compatibility.

| Page type | Images | Smallest–largest preview |
| --- | ---: | ---: |
| Rewritten guides, using their new illustration | 48 | 11,565–59,422 bytes |
| Legacy local CMS guide hero sources | 31 | 34,224–62,087 bytes |
| Default home / calculators / account / other inherited pages | 1 | 31,744 bytes |

The guide and blog metadata helper maps owned local assets to their social derivative; external CMS image URLs
remain unchanged. Rewritten guides explicitly set both Open Graph and Twitter images, dimensions and localized alt.
Legacy guide metadata preserves localized alt and adds dimensions for mapped images. Root/default metadata now uses
the small JPEG. Browser verification exposed shallow Open Graph overrides on home/calculators that discarded the
root image; these now explicitly include the small default image. No title/description translations changed.
All 48 CMS review JSON documents and their exporters use the new social URLs. No CMS database import performed.
Generate derivatives after any future illustration change with node scripts/images/generate-social.mjs.

## 3. Source compression and visual quality

Converted four questionnaire images, five measurement illustrations and the 404 mascot to WebP; updated references.
Questionnaire sources are at most 1400px wide (one 1000px), measurements 1000px, mascot 768px. These are no more
than twice the declared largest rendered widths of 700/500/384px respectively; no upscaling was introduced.
Added responsive sizes to questionnaire/measurement/mascot images. Existing aspect ratios and alt text remain.

Also compressed 31 legacy guide PNGs, the report bike diagram and retained script logo in place, using palette PNG.
This keeps existing CMS/PDF/script URLs valid while meeting the public budget. All 43 optimized sources are below
250,000 bytes. Original files are preserved only in the ignored illustration-sources/originals directory.
47-replacements.json maps the ten renamed application assets; 47-optimized.json records exact output dimensions.

Captured 13 browser before/after comparisons: all ten renamed sources plus representative legacy guide, PDF diagram
and script logo. Reviewed the comparison sheets and dedicated guide social image; subjects, linework, measurement
markers and transparency are preserved at displayed sizes. Screenshots: code-renders/47 (ignored, not in manifest).

## 4. Unused public assets

Repo-wide reference search covered source, CSS, tests, Convex, scripts and CMS JSON. Removed the eight unused PNGs
listed in the brief from public; original copies are in the ignored archive. Historical plan mentions are not runtime
references. Kept logo/bestbikefit4u-logo.png because a script uses it, and compressed it in place.
The 9.35 MB home GIF has no runtime consumer but is an input to convert-hero-video.sh: archived it outside public
and updated that script to the archive path. Kept the deployed MP4/WebM. The conversion script requires the local
original if someone regenerates those videos in a fresh checkout.

## 5. Budget guard

scripts/check-image-weight.mjs plus npm run lint:images, included in npm run lint. Raster maximum 300,000 bytes;
SVG maximum 150,000 bytes. Only the two explicitly named home videos are allowed. New video paths fail until reviewed.
Unit coverage checks both thresholds, an exact-boundary pass, explicit video exceptions and rejection of public guide SVGs.

## 6. LCP / image delivery review

- Current home: text and inline calculator illustration lead the page; no hero raster request. Header logos are small SVGs.
  The reusable legacy HeroBackground poster retains fetchPriority=high and now declares its actual 480×324 dimensions.
- Guide: next/image priority creates an image preload. Correct sizes are `(max-width: 700px) calc(100vw - 40px), 500px`.
  At a 1440px viewport the browser selected the 640px optimized derivative for the approximately 501px hero, not the
  largest srcset URL. Exact currentSrc/preload evidence is in 47-browser.json.
- Saddle-height calculator: the diagram is inline SVG, with no external raster LCP image to prioritize.
- Dashboard: source review confirms the top section contains text/actions, metric cards and a fixed 64px profile avatar.
  There is no large raster hero needing preload. Report-card bike images are below this content; preloading them would
  compete with the initial view. Dashboard inspection was a code review, not an authenticated production performance trace.

## Verification

- Full npm test: 2,015 passed, 25 skipped; 315 suites passed, 2 skipped. No failures.
- Full npm run lint passes, including contrast, CSS-module tokens and the new image budget.
- Full npm run typecheck passes. git diff --check passes.
- Production build and TypeScript stage pass in an isolated snapshot.
- Browser: home, rewritten guide and calculator return 200; OG and Twitter point to the same small JPEG;
  OG width/height/alt are present. All 80 social files pass dimension/size unit tests.
- 226 focused guide/social/metadata tests passed after metadata changes; final full suite also passed.
- Snapshot source hash: d7fafda22beebcc469a25ef28b3994fb8096761aa3a72c6843c4757e23d9ac5b; build ID: KOVrdEMEmJFjjSNTOXxh1.
- Browser proof: 47-browser.json. File list: files-47.txt.

Per lead convention, files-47.txt contains no PNG paths, including modified/deleted source PNGs. Those changes are
fully enumerated by the before/after inventories, replacement map and compression report. Archived originals and
review screenshots are ignored. No external image service or new dependency was introduced.

DONE 47.
