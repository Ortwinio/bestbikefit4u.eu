# 12 — Content pages: core (next free agent)

Read `README.md`, `BOARD-RULES.md` (including "Marketing & content pages") and `audit/route-map.md` (Public marketing + SEO/content) first. **Use subagents: one per board.** You do the final check yourself, including making the footer identical everywhere.

Boards (under `drafts/`), in this order:
1. `HowItWorks.dc.html` — `/how-it-works` (define the footer here; that becomes the standard).
2. `MeasurementGuide.dc.html` — `/measurement-guide`: every measurement with an illustration and short steps; links to the configurators.
3. `FitPass.dc.html` — `/fit-pass`: product landing; payments paused → show the real CTA state.
4. `PainIndex.dc.html` — `/pain` and `PainDetail.dc.html` — `/pain/[slug]` (template, 1 real example, e.g. knee pain): problem → likely causes → what to adjust (linking to the tools) → when to see a fitter.
5. `WhyBikeFit.dc.html` — `/why-bikefit-matters`.
6. `BikeFittingLanding.dc.html` — `/bike-fitting` + `/bikefitting` (one design; NL copy).
7. `BikeSetup.dc.html` — `/fiets-afstellen`.

Done when: checkers PASS; renders; `audit/12-notes.md` (content sources file:line per section, the example slug, suggestions). No app code, no commit. Print `DONE 12`.
