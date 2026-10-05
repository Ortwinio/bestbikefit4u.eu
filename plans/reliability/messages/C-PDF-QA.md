# C PDF QA handoff to A — F1

PDF report rendering is ready. Root C is wiring actual owned reliability evidence in the backend query;
renderer/mapper treat missing historical provenance as declared, never as a measured value.

Run from the assigned reliability worktree (all artifacts remain local; no service calls):

```sh
cd /Users/ortwinverreck/Developer/bikefitboost-reliability
node /Users/ortwinverreck/Developer/bikefitboost-reliability/tests/visual/pdf-report/render.mjs
PYTHONPATH=/private/tmp/f1-pdf-python python3 /Users/ortwinverreck/Developer/bikefitboost-reliability/tests/visual/pdf-report/verify.py
```

Both now default to `plans/reliability/renders/pdf/` (ignored), or set absolute `PDF_RENDER_OUTPUT_DIR` for both.
The local Python dependency is isolated in `/private/tmp/f1-pdf-python`; no repository dependency was added.

Expected artifacts: `26-report-{nl,en}.pdf` (baseline), `26-full-report-{nl,en}.pdf` (full real-engine fixture),
HTML and rasterized pages, `26-browser.json` (10 fixture/locale rows, six pages, no overflow), `26-pdf.json`
(four PDFs, six A4 pages, N/6 footer, three embedded font families, Dutch copy checks). Stress variant artifacts
are in a temporary directory printed by the runner. Existing board renders are also emitted for comparison.

Focused suite: `node_modules/.bin/vitest run src/lib/reports` — 94 tests pass. Covers preserved 787 mm engine
centre, measured inseam yielding ±23 / 765–810 mm, declared fallback, omission without range evidence, no
legacy test/safety-band render, actual model ± values replacing the confidence percentage. NL/EN rendered
summary/fit-value pages were visually checked and zero overflow is confirmed across all variants.

Evidence authority: Rapport sample C/D ±20/±15 is only valid after evidence; unknown values remain ±30/±25
per the written model. Stem and bar-width uncertainty is unsupported and stays blank. Crank uses size range.

Email renderer/preview command is owned by root C; this subtask changed report code only.

Email previews: `node /Users/ortwinverreck/Developer/bikefitboost-reliability/scripts/render-email-previews.mjs --output=/Users/ortwinverreck/Developer/bikefitboost-reliability/plans/reliability/renders/email-previews`. Current evidence: 42 bilingual HTML/text messages, 84 screenshots, no failed images/layout/overflow checks.
