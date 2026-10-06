# Homepage visual review — build 6

Reviewer: Codex U1 homepage agent. Build ID read from `.next/BUILD_ID`: `9eTXrYdBYp5cFF1Cohdt-`.

Evidence directory: `plans/usability/renders/guard/build6/`. Inspected all 18 homepage images directly with view_image, including readable original-width crops of hero, routes and expanded content. Crops remain outside the repository under `/private/tmp/u1-home-build6-review/`. The full guard report had not yet been written at review time; no source fingerprint or evidence hash is inferred from an earlier run.

## Observed results

| Case | Actual reviewed states | Findings |
| --- | --- | --- |
| NL 390×844 | default, edited, reused, details-open, menu-open | Pass for captured homepage layout. One-row header; 5+6 ordered route chips and both start buttons readable. The former floating-feedback obstruction is gone: edited/reused hero prose and both CTAs are fully visible. Default 175 cm is labelled voorbeeld and grey. Edited 176 cm shows 730 ±45 mm with a visible slider focus ring. Reused 184 cm shows 764 ±47 mm and “Uit je eerdere invoer”. Report details contain the retained guidance rather than a duplicate open section. |
| EN 390×844 | default, edited, reused, details-open, menu-open | Pass for captured layout and feedback-overlap correction. Long English route labels wrap cleanly; full route lists remain readable in the menu. Default/edited/reused widget states match the Dutch numerical transitions; reuse is explicitly attributed. Minor nonblocking wording inconsistency remains: homepage “My posture” versus menu “My position”. |
| NL 1440×900 | default, edited, reused, details-open | Pass for captured desktop layout. Two-column hero, balanced route cards, visible start buttons, compact three-line fit-plan summary and expanded report remain within their columns. Edited/reused widget values and provenance are readable. Current single/annual prices are visible, with no fabricated testimonials. |
| EN 1440×900 | default, edited, reused, details-open | Pass for captured desktop layout. English headings and long route labels fit. The disclosure expands without truncating the report or practical guidance; free-account and pricing actions remain distinct. Same correct visible example/edit/reuse transitions as the other cases. |

## Rule assessment

- **4 — Visual pass in all four cases.** Two routes with 5 and 6 direct calculator choices, ordered consistently with Main/m/Home, retain the live saddle widget. Link destination execution remains the automated guard's responsibility.
- **12 — Captured appearance passes; lifecycle remains separate.** No upgrade overlay, countdown, urgency or fear copy is visible in any reviewed state. Cookie consent is a distinct dismissible notice, not a paid upgrade. These static images do not demonstrate the leave notice's once-per-session lifecycle; this review does not sign that behavior without interaction evidence.
- **14 — Visible homepage claims/prices pass.** The closing block shows €13,50 / €21,50 in Dutch and €13.50 / €21.50 in English, with free-start framing. Expanded guidance gives practical reversible adjustments and professional-help advice; invented rider testimonials and counts are absent. Actual widget values were inspected rather than approved solely from source. Payment fulfillment and detailed report entitlements are not proven by screenshots.
- **15 — Visual legibility passes in the captured states.** Prior mobile feedback text occlusion is resolved. Controls, route chips, headings and open disclosures have no visible clipping. Edited slider focus is visible. Exact 44 px dimensions and numerical contrast ratios require the corresponding completed guard measurements; no such numerical conclusion is fabricated while its report is pending.
- **3 — Homepage-relevant evidence only.** Both routes and reused 184 cm attribution are visible. The homepage does not itself have an in-route step counter. These screenshots do not establish next-calculator transfer or deduplicated reasons; those belong to the separate genuine handoff interaction checks.

The default mobile cookie notice temporarily covers the refinement CTA but leaves the header clear. This is unchanged, dismissible, and distinct from the fixed feedback obstruction. The no-account widget is readable above it. No source, harness or application changes were made during this review.

## Exact screenshot binding

| File | SHA-256 |
| --- | --- |
| `home-nl-390.png` | `51ae81c5d5aaf173834e8243a317bf71de3ce1135a3d8187be2d198c5b71d395` |
| `home-nl-390-edited.png` | `5883311e7d498a24702200c42a4dbffc19d0faaafcfa0e910fb292d70583047f` |
| `home-nl-390-reused.png` | `9a1f2383be54d3cc1ae85d9b96d6fd1fe981f4d95d8c66a5fd3a44ea29ab2284` |
| `home-nl-390-details-open.png` | `52171e9d484d0c602a064061f326a9a693863d5e88da0a0cd8de15bb8ded90dd` |
| `home-nl-390-menu-open.png` | `d13090c6222eaa09aecc9ead19706ffbca170cdcec51d3af1833222490aff2e3` |
| `home-en-390.png` | `ca819c2d78c01faf51587efe79d3fad84f97ca92995cdedbcedf1426cc3aefc4` |
| `home-en-390-edited.png` | `1e01b5c3570e43e0c318e52b2ae736d86dada1db069737bfc6219180b481e168` |
| `home-en-390-reused.png` | `a73dd457c90c4d86a5b67f8e05b032f4134d0a4bef6c5b30f0ee15c38184f39d` |
| `home-en-390-details-open.png` | `e8927d0e45cd3c01a029641881dcd021f8c98f0bfcf2c0dfe2c65e79c366294f` |
| `home-en-390-menu-open.png` | `88374b1bc60524a62bdd069fb84740094e8a1a0649debb4537b01ab82da217a2` |
| `home-nl-1440.png` | `66b581952bb425022d83ef98c2be02dc7db51db6e589a1896cdc97a0e3bc8dd5` |
| `home-nl-1440-edited.png` | `d1108da63d3b0f12c142c99795ec35cd5b5ba969061599b836cdd74769f0b2b4` |
| `home-nl-1440-reused.png` | `010749eae4265b3454594e6d4789b0e9f3bdbb381d6263db5d3f24ee8b845e31` |
| `home-nl-1440-details-open.png` | `f9d7be6807368dc2bb95a1dc942eaf9c2730eef46ab43c0563fda92da67b790d` |
| `home-en-1440.png` | `40b003307f2638d6526b969a150fa431ae948610caede4846455be59dc28b7b3` |
| `home-en-1440-edited.png` | `08ede29fc7ebdc0432700ccd623272a774e2f77f59de135844bc6412bc8110a7` |
| `home-en-1440-reused.png` | `60dab4e38fb82ed6373b319fb6cf2352d278288e865be8d410cb44345064a7e4` |
| `home-en-1440-details-open.png` | `dc58c4843467f3dd103aaebee06cc95f52fe86320344ea3843bf11869d5c8d42` |

## Rule 12 lifecycle: separate source and test review

Read-only review of `src/components/calculators/LeaveDataNotice.tsx`, its test file, `src/lib/calculatorData/CalculatorDataProvider.tsx`, and `src/lib/handoff/store.test.ts`. No additional browser or test run was performed for this addendum; this describes assertions present, not a fresh passing execution. The screenshots above prove appearance only.

- The notice tests cover desktop top-edge exit (not ordinary mouseout), no-data/authenticated/excluded-route suppression, English Escape dismissal, touch display only after data becomes eligible, touch dismissal, localized handoff links, and analytics payloads without measurement values. The desktop dismiss/unmount/remount test explicitly checks the `bbf.leave-data-notice=shown` session marker and that the notice does not open again.
- Source uses the same session marker before either touch or desktop display, preserves it on dismiss, and suppresses the notice when storage is unavailable. Touch remount suppression and this storage-error branch are not directly asserted in the notice tests. The provider only mounts the notice in its anonymous session branch; eligibility comes from stored session entries, not untouched form defaults.
- Independent handoff store tests assert session-only values regardless of cookie choice, removal of legacy localStorage values, no revival after simulated session clearing, validated provenance retention, and resilience to unavailable storage. These support the session-retention explanation, but do not prove successful account import after the notice CTA. The notice link test prevents actual navigation; provider tests mock the notice.
- **Unresolved source-derived lifecycle edge:** `mode` is not cleared when `eligible` becomes false. If an open notice remains mounted while navigation enters an excluded route, it is hidden by the render guard; returning to an eligible route renders the existing non-null mode again without checking the session marker. Clearing and re-entering data while the open component remains mounted has the same shape. Existing tests dismiss before remount and do not cover open `eligible=true → false → true`. This is not a browser reproduction; it prevents unconditional once-per-session lifecycle approval until explicitly checked or fixed.
- Actual route/reload/new-tab behavior, touch once-per-session remount, and successful account persistence remain outside these notice unit assertions. No static screenshot is used to approve those lifecycle claims.
