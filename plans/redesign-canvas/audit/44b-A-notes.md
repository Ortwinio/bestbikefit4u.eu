# 44b-A — bilingual guide rewrites

Batch complete, awaiting lead review; no commit, push, CMS write or production publishing.

## Scope and integration

- Task 40f was already complete before this batch. Older 42/43c/46 assignments are complete and ignored as requested.
- All twelve Batch A slugs are preserved. Each guide has NL-first and equivalent EN content in `src/lib/guides/content/batch-a/`.
- Shared `GuideRewrite` contract, renderer, title registry and audit script belong to C. C registered A's content/title exports; A does not edit those shared files.
- The lead explicitly approved subagents. Separate agents authored body/frame guides, foot guides and contact-point guides; root owns the power hub, illustrations, exports and final review.
- New bilingual titles live in `src/i18n/marketing/guideRewriteTitlesA.ts`. Existing `messages/nl.ts` and `en.ts` remain untouched by this batch.
- Natural Dutch keywords replace awkward literal search phrases where necessary. Related links use final target titles. The power hub also links to B's FTP, power/speed and climbing guides.

## Illustrations

- Read the full `bestbikefit4u-illustraties` skill and used its requested route B, drawing from code. No photos or image-generation service.
- Drawing source: `scripts/guides-batch-a/draw.py`; uses C's verbatim skill engine in `scripts/guides-batch-c/bbf-illustraties/` without modifying it.
- Twelve new SVG/WebP pairs, numbered 09–20, under `public/illustrations/guides/`. PNG review artifacts under ignored `code-renders/44b-A/` are excluded from the manifest.
- All WebPs are 1600×1000 and below 200,000 bytes. Full contact sheets reviewed; revised short-torso emphasis, spacing between compared riders and the saddle-height dimension. Individual saddle-height/insole/knee images reviewed at full size, and final illustrations reviewed alongside their page text.
- These are explanatory drawings, not anatomical measurements or prescriptions. Alt text describes actual visible content.
- Render command: `DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib /private/tmp/bbf44c-illustrations-env/bin/python scripts/guides-batch-a/draw.py`.

## Content safety and sources

- The writing guide supplies the one-change/two-to-three easy rides comparison and referral after three-to-four careful changes. Articles explicitly stop sooner for pain, reduced sensation or unsafe control.
- No symptom-location diagnosis or universal cleat angle, pedal spacer thickness, shoe allowance or handlebar correction is invented.
- Knee red flags checked against [NHS knee pain](https://www.nhs.uk/symptoms/knee-pain/): acute severe pain, inability to bear weight, major swelling/locking and hot red knee with fever need prompt medical assessment.
- Manufacturer references support installation limits; each guide directs readers to the manual for their actual equipment rather than transferring a number between incompatible systems.
- Power/FTP explanations follow the existing calculator's definitions. The hub distinguishes measured power, speed and a training estimate; it does not promise performance gains or diagnose posture from power.
- Other primary references: Trek owner's manual and geometry tables (insertion limits and distinct reach/stack dimensions); Shimano SPD-SL installation, shoe-fit and road-footwear guidance; Shimano 0MX0B controls manual; TIME Pedalfit and Wahoo SPEEDPLAY POWER setup. Links sit beside the narrowly supported claims in each article.
- Independent review corrected a saddle-height instruction: leave the rail-clamp position alone, rather than promise unchanged setback when raising an inclined post. Saddle-height dimensions in the drawings now use the direct bottom-bracket–saddle reference, not just vertical height.
- An initial paragraph-formatting attempt damaged several foot-guide step headings/tails. All four articles were manually repaired and reread independently in both languages. Regression checks now verify six intact step captions and actual rendered paragraphs, not just raw Markdown counts. Final CMS exports were regenerated after repair.

## Publishing boundary

- CMS-schema JSON under `guides-import/` is review-only (`status: in_review`, `importStatus: 44b`), with matching bilingual prose, FAQs, metadata, alt text, related links and 2026-10-01 dates.
- `scripts/guides-batch-a/export.mjs` emits the documents to stdout; root applies those files. It never creates a database client.
- C noted that the existing import mutation omits `featuredImageAlt` although the schema supports it. The publishing owner must preserve that field when importing; production publishing remains separately authorized.

## Validation

- Batch A suite: **37 tests pass**, including all 24 localized articles, exact CMS parity, metadata, section/FAQ lengths, final link labels, at least two inbound links, numbered steps, rendered paragraph limits and twelve image specifications.
- Full `npm run lint` and `npm run typecheck`: PASS after the final source corrections. Contrast 254/254, token-only CSS modules 19/19.
- Final isolated production build after rider corrections: PASS. Snapshot `62bbd40f360b72a6cb136ea24ee891db3234488175aad2bbc6bd46ad6ab10849`.
- Shared 44a audit: **24/24 localized pages pass every check**, with 1,069–1,210 visible words per article. Covers section/FAQ lengths, sentence/paragraph limits, NL copy, links/inbound links, metadata, Article/FAQ/Breadcrumb data, canonical/hreflang, date and image specifications. The filtered inbound graph already gives every A guide at least two incoming guide links; the complete cross-batch graph remains C's combined check.
- Final browser proof: **48/48 captures pass** (12 guides × NL/EN × 1440/390), with zero failed statuses, overflow or page errors. Actual `code-rewrite` source marker verified for every case. Screenshots: `code-renders/44b-A/`; machine proof: `audit/44b-A-browser.json` and `audit/44b-A-audit.json`.
- Initial editorial findings on paragraph limits, the Dutch homograph `smaller` and one missing inbound link were fixed before the final build. Independent bilingual review found no remaining damaged foot-guide steps or substantive safety/translation mismatch.
- Initial broader shared guide regression run had 11 failures on pre-44b labels/legacy-template expectations, routed to C. After C's corrections, A reran the three affected suites (`GuideBodyMarkdown.test.tsx`, `localization.test.ts`, `guides/[slug]/page.test.tsx`): **30/30 pass**. A leaves those shared files untouched.
- The temporary capture runner `/private/tmp/bbf44a-capture.mjs` reuses C's established capture workflow with Batch A names, port 4376 and output paths. It calls the unchanged shared 44a audit script against a fresh isolated production build; it does not patch the snapshot's source or connect to CMS writes.

## Lead rider-geometry correction

- Rebuilt mounted figures in 09, 10, 11, 17, 18 and 19 from the actual `Fiets.teken()` saddle, handlebar and pedal points. Hip touches the saddle; two-segment inverse kinematics joins thigh/knee/shin/ankle and shoulder/elbow/hand without stretched segments. Shoes contact the drawn pedal platform; hands contact the hood derived from the handlebar anchor.
- Hatched tube limbs now meet at opaque joint shapes. Neck, shoulder and pelvis connect. Standing figure 14 also has connected shoulders/neck and grounded shoes.
- Lime accents follow the topic: frame, torso, knee, drivetrain or actual seatpost. The saddle-height ruler is petrol, not a floating lime accent.
- Root visually inspected all seven revised images (09/10/11/14/17/18/19) at native 1600×1000 and individually at 390×244. No detached limbs or missed saddle/hood/pedal contacts remain. Thumbnail proof is under `code-renders/44b-A/rider-review/`; PNGs stay outside the manifest.
- `rider_geometry_test.py`: two tests pass, covering 24 combinations of scale, crank angle and torso configuration, exact contact anchors, fixed limb lengths and rejection of unreachable endpoints. Batch A Vitest suite rerun: 37/37 pass.
- Reproduction: render with the command above, then run `rider_geometry_test.py` and `review-riders.py` using the same Python environment. Shared drawing-engine files remain untouched.

Exact manifest: `files-44b-A.txt` (62 existing paths, no PNGs, no shared files owned by C).
