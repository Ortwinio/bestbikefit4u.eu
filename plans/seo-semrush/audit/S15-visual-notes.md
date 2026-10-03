# S15 final visual review

Final production build: `rejwcKGnhSNUclqs6ffwl`. Completed 3 October 2026.
Visual work changes only QA harness/evidence; no application redesign, deployment or production calls.

## Capture coverage

- AFTER: all 84 cases on the final post-S16 production build, 21 templates × NL/EN × 1440/390.
- Templates: home, all eleven calculators, saddle-height guide, contact, FAQ, author, methods,
  three bike-type pressure pages and bikefitting. Home/bikefitting include dedicated footer crops.
- BEFORE: 68 real captures from archived base `e93f8c1c1486b56c111b80226a5bad6559b74aa9`;
  isolated baseline build `jimQ2H4H4ym6thM0jkhma` in /private/tmp. Shared source was never checked out/reset.
- Sixteen new-page cases have no invented baseline: author/methods both locales, three EN canonical
  pressure pages and NL mountainbike pressure. NL road/gravel compare against the actual former pages.
- Baseline uses real source/CSS/images and local Bricolage Grotesque, Figtree and DM Mono font files.
  The Next font-response mock avoids Google network requests, not a generic replacement font.
- Signed-out local HTTPS; nonlocal browser requests/WebSockets blocked; backend URLs are closed loopback.
  No authenticated data, email submissions or production mutations.

## Final checks

84/84 HTTP 200. Zero document overflow, page/console errors, failed HTTP assets, broken images or axe
violations. The former moderate landmark-unique finding is gone in every final case after S16.
All 68 comparable baseline cases had that finding; new pages inherited it before S16.
Full JSON retains axe incomplete checks; zero violations is not a claim of universal accessibility conformance.

Full-page review of all 84 pre-S16 AFTER captures used sequential strip sheets: mobile at native 390px,
desktop displayed at 720px. Seven overview sheets and footer crops supplement, not replace, that review.
The final rerun was compared to the reviewed checkpoint: **83/84 full PNG hashes identical**; all recorded
page/section/footer geometry identical. Evidence: S15-visual-preS16.json and S15-visual-final-checkpoint.json.

The sole changed PNG is NL bikefitting at 390px. Parent inspected its complete final page against the
prior strip sheet and native-resolution comparison crops. Difference is limited to the two outline
account CTA text/width renderings (4,240 pixels across 88 rows); page height remains 6,287px. No clipping,
section movement or content change. Source diff confirms no visible page/button styling change for
this route. The capture variation is recorded, not represented as pixel-identical or hidden.
See S15-S16-bikefitting-nl-390-top-comparison.png and bottom-comparison.png (prior left, final right),
plus S15-visual-difference.json. The crops are QA comparisons, not synthetic BEFORE pages.

Baseline manual full-page comparisons were selective: home NL/EN both widths; crank-length EN390;
contact NL390; guide NL1440; pressure-road NL390; pressure-gravel NL1440; bikefitting EN1440.
All 68 baseline cases additionally have automated geometry/overflow/axe comparisons.

## Intended visible changes; no unreported redesign

- Home replaces unsupported ratings/counts/testimonials with neutral guidance in the existing sections.
- Calculators retain their controls/results layout and gain answer/example/method/FAQ content below.
- Guides gain real authorship/date/method links and descriptive tool/bike-fitting anchors.
- Contact gains explanatory support copy and useful links; the mailto behavior remains unchanged.
- Footer adds `Wat is bikefitting?` / `What is bike fitting?` in Product. Footer height is unchanged
  in all 68 comparable cases. This is a visible link addition, not an invisible metadata-only change.
- FAQ and bikefitting retain the same document heights at both widths/locales.
- NL road/gravel pressure pages intentionally become the approved consolidated tables and shorter pages.
  Author/methods and new pressure destinations use existing site styling; do not claim identical old layouts.
- S16 changes accessible names only; visible language labels, destinations and switching behavior stay intact.

## Existing presentation observations

NL390 footer long calculator labels break mid-word in both baseline/final, without document overflow.
Contact NL390 floating feedback overlaps the right edge of the email CTA at one viewport position in both.
Crank-length EN390 `recommended` breaks before its last letter in both. These baseline observations were
sent to the shared-layout/calculator owners and lead in B-to-C-lead-S15-baseline-presentation.md for
separate prioritization, not silently fixed in a no-redesign task. Fixed overlays were not hidden in captures.

## Harness and resolved blockers

The unnecessary require in the baseline font mock was removed after lint flagged it. Scoped harness lint
and full final lint pass. S16's unsupported test options were removed by B on explicit lead authorization;
final typecheck/build passed before this rerun. Earlier blocked handoff wording is superseded.
BEFORE evidence and pre-S16 hashes are retained. No final visual blocker remains.
