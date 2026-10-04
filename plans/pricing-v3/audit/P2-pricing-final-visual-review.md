# Final pricing matrix — manual review PASS

## Final v3 verification by parent

Build6KW82hm49ljNYI1ddtwmm: all12 pricing PNGs (eight full pages,four mobile viewports) match their reviewed
v2 hashes exactly. No new delta. Final200 capture passes; compiled CSS comes from the same-build disk
manifest and is independently byte-verified against the repaired local HTTP preview (P2-css-provenance.json).
The earlier origin60620/buildv2 review below remains valid through that exact image comparison.

Reviewed all eight final pricing images through four byte-identical OFF/ON pairs. Manually inspected each unique full-page image plus the NL390/EN390 viewport images. No new capture, app edits, harness edits, server restart or build by this reviewer. Earlier isolated component screenshots are not used as this acceptance evidence.

## Final provenance

- `renders/p2-visual/report.json` completedAt: 2026-10-03T21:03:47.152Z; 200/200 overall captures completed, failures empty.
- Final production CSS source: production-server, `http://127.0.0.1:60620/`; shared build `0Dw9Uq506jBKvW5c7Uwwh`.
- `results.json`: all eight pricing cases captured, fonts loaded, document overflow false, empty runtime errors, blockedRequests and failedRequests.
- Original timeout diagnosed as request-scoped next/headers in JsonLd running in a browser fixture. Einstein corrected the fixture boundary; fresh evidence supersedes the earlier failed partial results. No pricing source bug established.

## Final rebuild comparison — unchanged 8/8

Read the 300-entry baseline `renders/p2-visual/initial-screenshot-hashes.json` (initial build `UYxIkN6xXxBU0VSr0nQh7`, origin58410) and recomputed SHA-256 from each of the eight final pricing PNG files. All eight exactly match their respective baseline entry and the accepted hash table below: **zero changed pricing images**. Final results also confirm all eight captured, loaded fonts, no overflow and empty runtime/blocked/failed-request lists.

The prior manual acceptance therefore carries forward to final build `0Dw9Uq506jBKvW5c7Uwwh` without duplicate visual inspection or captures. Pricing source remained frozen. Parent reports final v2 gates green: 3322 unit tests passed / 20 skipped, production build passed, crawl 875 passed; this reviewer did not repeat those gates. Only the eight full-page pricing hashes are asserted by this final comparison; prior supplemental viewport inspections remain initial-run evidence.

## Explicit image coverage

All filenames below are under `plans/pricing-v3/renders/p2-visual/`. SHA-256 is identical for both members of each reviewed pair.

| Manually inspected full-page image | Identical covered image | SHA-256 | Result |
| --- | --- | --- | --- |
| nl-pricing-off-1440.png | nl-pricing-on-1440.png | 48446d8400bbf07cdd662484bae12a434514140917505497fa230561fe771c1a | PASS |
| nl-pricing-off-390.png | nl-pricing-on-390.png | 6d21b5056b0c53bdc2b56b2910e119436495b8bfa9a7addc6dbfa526b740f6f9 | PASS |
| en-pricing-off-1440.png | en-pricing-on-1440.png | 94528b6a1d59179eff71e42d48bb9be31e83c5c0cde461b3e0268e8ca1ba0ee0 | PASS |
| en-pricing-off-390.png | en-pricing-on-390.png | 87c8f3e6d1bba5620f0003d2b4dc4f0fd2480f6448945f89df20fbad8c300607 | PASS |

Additional inspected viewport evidence: `nl-pricing-off-390-viewport.png`, `en-pricing-off-390-viewport.png`.

## Visual findings

- Desktop: single / annual / personal order; annual centered, taller, ink surface, lime amount/CTA and favourite badge. All three complete card headings, VAT/periods, renewal copy, features and CTAs remain visible without overlap/clipping.
- Mobile: annual first, then single and personal. Titles/amounts fit cards; header logo/language/menu fit at 390px. Card widths stay within page padding. Footer stacks cleanly and the final trial CTA remains contained.
- NL/EN: correct decimal separators, €13.50 / €24.50 / €234.50 equivalents, annual €19.50 renewal, translated public copy and literal appointment placeholders. No rating/review strip or retired monthly price seen. Only the permitted standard annual gift feature appears.
- Free comparison, advice, FAQ and final trial CTA retain readable hierarchy. Mobile wide comparison table is contained in its horizontal scroll region; the screenshot shows the initial columns, without page-wide overflow. Screenshot review alone does not prove horizontal keyboard interaction.
- Full shared header/footer render consistently in both locales. No fixture loading/error state remains. Public pricing correctly does not change with paid-access enforcement.
- Harness small-control observations concern the inline “Create a free account” / “Maak een gratis account” text link (20px high), not purchase buttons. It is in a sentence of body text; no pricing card-action size failure observed. NL mobile wraps this link. No source change requested for this existing inline-link presentation.

## Limits / handoff

Acceptance covers the eight specified production-CSS component-fixture images and their visual layout. Synthetic services and header adapters do not prove live Next request/nonces, real auth, backend enforcement, payment or accessibility certification. Prior focused pricing/checkout tests remain separate evidence; no full gates repeated here. Parent owns remaining matrix/release report. Pricing manual review is complete with no outstanding visual blocker.
