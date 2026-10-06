# Final14 calculator re-review — A

Build `A-_g2mE1fYoPQrVxnnicS`, source `7ac3273c4a78cb5521d3fe5debb787da095ba4e87b5a31989eb60140a8b2738d`.

This supersedes the final13 approval for the same 24 cases / 204 required manual checks. My final13 review correctly identified the gearing method mismatch but missed unsupported upgrade-verdict claims in its separate trust panel. B's subsequent finding was valid; the old review is historical, not final approval.

## Fresh inspection and provenance

All 140 image hashes and 24 evidence hashes were independently recomputed against final14. All 28 changed images were freshly viewed: 18 gearing default/menu/expanded/edited/reused images, all four pressure-to-gearing transitions, and six incidental mobile captures (saddle NL menu/full, crank EN menu, saddle-width NL default/menu, pressure NL default). Expanded mobile gearing was additionally inspected in original-width crops covering method, worked example, trust cards, FAQs and related links. The 112 unchanged images exactly match previously reviewed final13 artifacts; their visual findings are explicitly re-attested, with prior provenance retained in the new JSON manifest. No changed image was approved by hash reassignment alone.

## Corrected gearing claims

NL/EN trust headings now describe an estimate for the easiest gear. Three cards describe cadence inputs, known/estimated FTP and uncertainty, and changing gearing/gradient inputs. None promises an upgrade verdict, exact personal drivetrain assessment or rider/event analysis. `src/i18n/calculators/gearingPage.ts:3` supplies the matching metadata, OpenGraph and WebPage description used by `src/app/(public)/calculators/gearing/page.tsx:75`.

The actual public branch at `GearingCalculatorForm.tsx:67` renders `PublicPerformanceCalculator`, rather than the legacy account gearing form. Its input controls and `power-speed/PerformanceReliabilityResults.tsx:60` use the same cadence model at `shared/reliability/performance.ts:14`: 85% FTP, fallback 3 W/kg, 9 kg bike, fixed resistance and 2.1 m circumference. Revised method and revised trust copy both agree with this path. Cadence is shown as an initial uncertainty estimate, not guaranteed sustainable performance. The separate worked example remains explicitly illustrative kinematics.

## Visual outcome

Default, edited and reused gearing states retain readable 58.1, 56.4 and 85.4 rpm results respectively, with examples distinguished from rider inputs. Reused 240 W FTP appears in the basis and the initial account reason is suppressed. Pressure-to-gearing transitions carry actual 76 kg, showing 58.2 rpm and assumed 228 W FTP without labelling those assumptions measured. Edited sliders retain visible focus rings. Safety/compatibility text remains outside disclosures. New trust cards wrap clearly on mobile and align in desktop columns; collapsed pages keep the short answer and next action available. Header/menu and feedback placement remain unobstructed. Initial cookie consent is dismissible and does not cover header/tab navigation.

All 24 current report records have no errors/failing checks, retained server-HTML disclosure evidence and successful actual next-calculator handoff evidence. Those measurements corroborate the visual/source review, not replace it. Earlier final13 per-calculator observations still apply to exact unchanged artifacts. No remaining blocker was found in this bounded scope; no app or harness source was changed during this review.

Evidence: `plans/usability/renders/guard/final14/manual-review-U2-calculators-A.json` (204 checks, exact 140-image manifest).
