# 13 — Content pages: library, service & report (next free agent)

Read `README.md`, `BOARD-RULES.md` (including "Marketing & content pages") and `audit/route-map.md` first. **Use subagents: one per board.** Take the header/footer from the approved `drafts/HowItWorks.dc.html` (if it isn't there yet: copy the header from `canvas/Pricing.dc.html` and build the footer per the rules; the lead makes them consistent later).

Boards (under `drafts/`):
1. `Guides.dc.html` — `/guides` (categories, featured, related blog) and `GuideDetail.dc.html` — `/guides/[slug]` (hub + article variant via state; breadcrumbs, table of contents, FAQ, CTA to the matching tool). Real example from `convex/guides` or `docs/cms-import`.
2. `BlogIndex.dc.html` — `/blog` (category filter as pills, pagination) and `BlogArticle.dc.html` — `/blog/[slug]`.
3. `ScienceArticle.dc.html` — `/science/*`: one template, 3 variants via state (bike fit methods, calculation engine, stack & reach), including a diagram built from real elements (not one big SVG) for stack & reach.
4. `About.dc.html`, `FAQ.dc.html`, `Contact.dc.html` (mailto, **no** invented form), `CaseStudy.dc.html` (recruitment form per `CaseStudyRecruitmentForm`).
5. `Legal.dc.html` — `/privacy` + `/terms`: one readable legal template (table of contents, date), the real texts shortened with `[…]`.
6. `PressureLanding.dc.html` — `/bandenspanning/[slug]`: the programmatic SEO result page (weight/bike type → pressure table) per `src/lib/seo/programmatic/tirePressure.ts`, 1 real example.
7. `FitReport.dc.html` — **PDF report, A4 portrait** (canvas entry gets `"paper":"a4","print":"flow"`; read `reference/format.md` and ask the lead for `print.md` if you need it). Source: `BestBikeFit4U_ExampleReport_EN_v2.pdf` in the repo root + `plans/report-v2`. Per the brand guide: an ink header strip with the negative logo, result tiles with large DM Mono numbers, and a lime "eerst aanpassen" block. 2–3 pages.

Done when: checkers PASS; renders; `audit/13-notes.md`. No app code, no commit. Print `DONE 13`.
