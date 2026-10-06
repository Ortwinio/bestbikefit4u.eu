# U1-BAR — final15

Current owner source: `6d4c2a43` (following `13d07dcf`). Frozen production build: `jytw4ikWvOEcr_Thl1YBK`. Full source fingerprint: `158078772d976cca10235f00342c79dfab36e65d40677185b0ddbbe52288636d`.

The stale guard and its local server were stopped. A rebuilt with `scripts/usability/build.mjs`; the build has valid application provenance. One initial new-build capture timed out navigating to the English desktop homepage and was rejected. The complete replacement `--scope=all` run passes 332 NL/EN cases at 390/1440, with zero failed automatic checks and zero console/page errors. Strict finalization passes all 15 rules: `releasePassed:true`, `manualOutstanding:false`, `errors:[]`.

## Owner exception and bar evidence

Rule12 permits only this owner-approved homepage conversion bar. No waiver applies to navigation, consent, dismissal, targets, contrast, footer access, safety, claims or any other paid overlay. A changed no bar application source or behaviour. Lead resolved the three preflight findings with token colors, z-index45 and in-memory dismissal.

The guard captures cookie-undecided, consent-decided/bar-visible, menu-open, edited/reused, scrolled footer, dismissed, session revisit and storage-write-denied dismissal states. Initial screenshots, axe scans and normal interactions use the visible bar, not a pre-dismissed state. Blocked storage is simulated only for the dismissal key; no production writes, external requests or real mail are used.

| Homepage | Length (screens) | Final14 | Bar height / body reservation |
|---|---:|---:|---|
| NL390 | 7.704976 | 7.509479 | 165 / 165px |
| EN390 | 7.731043 | 7.558057 | 146.25 / 146px |
| NL1440 | 4.528889 | 4.416667 | 101 / 101px |
| EN1440 | 4.528889 | 4.416667 | 101 / 101px |

The page-length increase matches reserved body space; no new homepage threshold is introduced. The existing seven-screen limit remains calculator-only. Footer overlap and covered menu/footer controls are zero; mobile paid CTA 350×44px and Close 44×44px. Normal dismissal, session revisit and denied-storage close all hide the bar. The denied-storage fallback lasts in the current document; it is not persistent across a hard reload with storage unavailable.

## Per-rule result

| Rule | Result | Evidence focus |
|---|---|---|
| 1 | PASS | Calculator account reason and next step remain below results |
| 2 | PASS | Explanations collapsed, text retained in server HTML; calculator length limit unchanged |
| 3 | PASS | Two routes, progress and reused-input indicators |
| 4 | PASS | Homepage routes, eleven one-click calculators and live widget with visible bar |
| 5 | PASS | Mobile header, cookie exclusivity and menu controls clear of the bar |
| 6 | PASS | Contextual paid limits and prices |
| 7 | PASS | Distinct contextual paid presentations |
| 8 | PASS | Example state clears on editing/reuse |
| 9 | PASS | Numeric input sliders |
| 10 | PASS | Measurement method preselected |
| 11 | PASS | Shared tyre-pressure UI plus six report/mail surface attestations |
| 12 | PASS — owner exception | Only this bar exempted; consent-first and dismissal verified, no other overlays/urgency waived |
| 13 | PASS | Safety remains visible |
| 14 | PASS | Current prices and real-feature claims |
| 15 | PASS | Axe/contrast, 44px controls, clear menu/footer and reserved bar height |

## Finalization and gates

Final evidence: `renders/guard/final15/reviewed-report.json` and `.md`; merged review contains 1,476 current checks and six surfaces. All 38 homepage captures are freshly inspected. Every other changed image region is also freshly reviewed; unchanged images retain prior review only with verified actual file hashes, metrics and source-input identity. Full source proof: `U3-A-provenance-proof.json`; individual comparison artifacts are beside the report. No stale hashes are reused.

Known capture limitations: existing moderate cookie-landmark axe advisory; the default NL1440 pain-detail decorative illustration is blank while its expanded state renders correctly. Text/actions remain readable. The fixed bar temporarily overlays scrollable content in the viewport; the clear footer/menu result does not claim zero overlap everywhere. PDF rasters are explicitly retained with unchanged-source/hash proof, not represented as freshly generated. These are local Codex reviews, not human approval, live authentication, payments or mail delivery.

## Combined gates — PASS (7 October)

| Gate | Result |
|---|---|
| Typecheck | PASS |
| Full lint | PASS, including token/contrast/brand/price guards; zero raw CSS Module colors |
| Unit tests | PASS: 4,329; 20 skipped |
| Contracts | PASS: 610 |
| Standalone Convex tsc | PASS |
| Production build | PASS: source-stamped final15 above, canonical URL and offline Convex |
| Local SEO crawl | PASS: 875 pages, zero findings |
| Local domain migration | PASS: 684 redirects, zero findings |
| Email previews | PASS: 42 bilingual HTML/text previews, 84 renders |
| Guard regressions | PASS: 85 |
| Strict all-scope review | PASS: all 15 rules, no pending manual checks or errors |

Typecheck, lint, unit, contracts, Convex, both crawls and email previews were rerun after strict finalization. The production build is the same source-stamped artifact used by the sweep, not a later unreviewed rebuild; crawls use `--skip-build`. Current source/build provenance remains valid. Post-review emails are in `renders/email-final15-post-review/`; all 168 HTML/text/image files are SHA-identical to the fresh, review-bound `email-final15/` outputs.

Gate logs: `audit/*-bar-post-review.log`, `audit/build15.log`; structured results: `renders/guard/final15/gates-bar-final.json`. The early test-environment mistake and rejected navigation-timeout run are disclosed in `audit/U1-notes.md`, not silently passed. Source-only file list: `audit/files-U1-BAR.txt`. No bar behaviour changes, commits, deploys, production writes, environment-file edits or real mails.

DONE U1-BAR.
