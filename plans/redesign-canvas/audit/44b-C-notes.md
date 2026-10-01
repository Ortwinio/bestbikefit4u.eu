# 44b-C — completed 2026-10-01

Owner C. Shared guide integration explicitly authorized by the lead. No commit, push, deployment or database writes.

## Delivery

Rewrote all 12 Batch C guides, Dutch first and then English, with distinct full articles for both hubs and leaves.
Each localized article has a quick answer, the five required sections, four FAQs, related guides, a calculator link,
and a closing CTA. Dutch uses je-vorm. The keyword “racefiets of endurance geometrie” uses the correct compound
“racefiets of endurancegeometrie”; a word-break opportunity keeps the mobile heading readable without changing its text.

Content lives in src/lib/guides/content/batch-c. Twelve schema-shaped bilingual CMS review documents live in
plans/redesign-canvas/guides-import; scripts/guides-batch-c/export.mjs regenerates these and the lightweight title map.
The exporter only writes files. It has no Convex client.

Shared integration adds a typed registry, full-article renderer, localized metadata/hero alt, visible update date,
Article dateModified, FAQ/Breadcrumb schema, and preserved authored link labels. Legacy CMS content falls back to
the code rewrite; a bilingual CMS record marked importStatus=44b takes precedence, keeping future CMS edits usable.
Explicit CMS draft preview retains its existing rendering path. Header/Footer and frozen root dictionaries were not
changed for this task. Other batches can register their records through the shared GuideRewrite contract.

The shared audit now accepts a local base, production canonical origin, batch filter and separate output file.
Filtered/local runs cannot overwrite the baseline audit. Required section order and image metadata are checked.

## Illustrations

Twelve new route-B illustrations, public SVG/WebP pairs numbered 33–44, with bilingual alt text.
All WebPs are 1600×1000 and below 200 kB (largest 120276 bytes in the final audit).
Used the full bestbikefit4u-illustraties skill:
/Users/ortwinverreck/.claude/skills/synced/0c1abaed-2dd7-48aa-9c40-860558849b78_86c85444-dcee-46eb-ac3a-bd832bfd8388/bestbikefit4u-illustraties/SKILL.md

The appendix scripts are copied verbatim under scripts/guides-batch-c/bbf-illustraties. draw.py is the drawing source.
No new application dependency. Local rendering uses a temporary Python environment and the installed Cairo library.
Reviewed the 12 illustrations and NL/EN desktop/mobile renders. Corrected the clipped gravel rider and mobile compound
heading before the final capture. PNG review artifacts stay ignored under code-renders/44b-C and are absent from the manifest.

## Verification

- 46 tests pass across batch-c.test.ts, rewrites.test.ts, RewrittenGuide.test.tsx and markdown-utils.test.ts.
- Full npm run lint passes, including 254 contrast checks and CSS-module token checks. Final heading adjustment also
  passes scoped ESLint. Full typecheck passes after that adjustment.
- An isolated production Next build passes. Final browser snapshot: /tmp/bbf-final-sweep-67d2e8dc3d9bc7d8;
  build ID bx4oaMHB9L1nXw1-rBB8Q. Exact source hash is recorded in 44b-C-browser.json.
- 24/24 localized pages pass the filtered 44a audit: 44b-C-audit.json.
- 48/48 browser cases pass: NL/EN at 1440 and 390, HTTP 200, expected rewrite source, no horizontal overflow or JS errors.
  Evidence: 44b-C-browser.json; harness tests/visual/guides-batch-c/capture.mjs.
- npm run seo:validate-sitemaps passes against http://127.0.0.1:3000.

Sitemap limitation: the isolated snapshot has no published CMS guide entries, so its sitemapListed field is false.
The existing article sitemap depends on published CMS records. Slugs/routes remain unchanged; this run does not prove
that all 24 article URLs appear in a published CMS sitemap. No sitemap behavior or database content was changed.
Inbound counts cover this batch only; every C guide has at least two inbound links within the batch. A full inventory
run is still needed to assess links across batches.

## Editorial sources and boundaries

Linked primary sources include British Cycling guidance on hand/wrist pain, saddle choice and foot pain; Shimano's
Short-Crank-Curious article; Sports Dietitians Australia's Fluids in Sport; AIS sports-drink guidance; and the 2015
exercise-associated hyponatremia consensus. Manufacturer geometry definitions inform stack/reach explanations.
The supplied writing guide provides the one-change/easy-ride review sequence. Numbness, worsening pain and skin injury
are explicit reasons to stop earlier. Sweat estimates are not mandatory drinking targets. No invented performance
percentages, universal component prescriptions or numerical nutrition doses were introduced.

## Publishing handoff

The JSON files are schema-shaped review documents, not direct arguments for the existing importGuide mutation.
That mutation currently omits featuredImageAlt and other editable fields accepted by the CMS schema, and the existing
CLI expects its legacy per-locale input. The separately authorized publishing step must adapt that import path,
preserve bilingual alt/OG/CTA fields and existing creation/publication metadata, and set importStatus=44b.
No database writes were made to work around this. CMS/code round-trip and edited-CMS precedence are covered by tests.

Changed files: files-44b-C.txt. DONE 44b-C.

## Lead illustration review correction — 2026-10-01

Rebuilt rider figures 37, 38 and 44 from Fiets.teken() saddle, bar, pedal and bottom-bracket anchors.
pose.py solves fixed-length two-segment knee/elbow chains. The shoe sole rests on the drawn pedal;
the wrist reaches the hood at its offset from the returned bar clamp. Continuous tapered, hatched tube
contours avoid detached joint ends. Corrected the observer's arms and attached shoes in 44 too.
Lime accents identify fit contact points (37) and the hood/hand interface (38/44), replacing broad lime frames.
Reviewed all three final images individually at native 1600×1000 and as 390px thumbnails; no detached limbs.
SVG/WebP overwritten at existing paths, so CMS/code image references remain unchanged. Appendix engines unchanged.
Two Python tests pass, including race/gravel geometry at seven crank angles and unreachable-target rejection.
All 25 Batch C content tests pass. Asset dimensions/size/hash evidence: 44b-C-rider-review.json.
Review PNGs are ignored and excluded from the file list. Earlier page screenshots predate this illustration correction;
the native and 390px asset review PNGs show the corrected versions. No application code changed for the rider correction.
