# 40b — Dutch pressure landing pages and calculator audit

Implemented by Codex C with calculator-copy and scan-harness subagents. No commit or deployment.
Exact owned file list: `files-40b.txt`. Root `src/i18n/messages/nl.ts` and `en.ts` remain untouched.

## Cause and changes

The `/tire-pressure/[slug]` route hardcoded `locale="en"` and English metadata. The shared
landing template already supported Dutch, but requests under `/nl/tire-pressure/...` never
selected it. Both page and metadata now use the request locale and the marketing dictionary.
All 30 weight/bike combinations render Dutch headings, intro, assumption labels, tables,
FAQ, CTAs, illustration alt text, breadcrumb ARIA label and structured data. Metadata title,
description, keywords and Open Graph text use the same locale-specific dictionary.
Dutch copy uses je-vorm and shorter sentences. English landing copy is preserved.

Canonical and hreflang remain the established pair:
- EN: `/en/tire-pressure/<weight>kg-<road-bike|gravel-bike|mountain-bike>`.
- NL: `/nl/bandenspanning/<weight>kg-<racefiets|gravelbike|mountainbike>`.
- x-default: English URL.

The Dutch alias renders Dutch while canonical, og:url and JSON-LD point to the valid Dutch
slug. CTA analytics record the actual visited alias. Generated slugs, pressure-engine inputs,
bar/PSI results, out-of-list numeric slug behavior, 404s and sitemap entries are unchanged.
Both route families share dictionary metadata. The Dutch pressure-calculator alias continues
to redirect to `/nl/bandenspanning-calculator`; its hreflang now correctly pairs that URL with
`/en/tire-pressure-calculator` instead of reusing one slug in both languages.

## Calculator follow-up

Audited every calculator route and the pressure calculator, including metadata, schema,
form labels, accessibility attributes and warnings. Fixed mixed-English Dutch prose in
power/speed, climb planner, FTP/Wkg and fuel/hydration pages. Their copy now lives in owned
calculator dictionaries. Also fixed saddle-height English schema, core/rompstabiliteit copy,
saddle-width category labels and the frame-size endurance description.

Original English objects from all four migrated performance pages were evaluated from HEAD
and compared with the migrated dictionaries: all existing EN values are identical. New Dutch
regressions assert actual strings. Original English academic paper/book titles remain as
bibliographic citations; they are not translated into invented source titles. Cycling terms
such as stack, reach, drop, cleat and gravel remain where appropriate.

## Validation

- Landing routes/SEO: 106 tests pass, including 30 Dutch requests on English slugs, all existing
  EN and Dutch variants, pressure values, FAQ/schema, metadata/canonical/hreflang and 404s.
- Combined landing/calculator command: 185 tests passed; 20 pre-existing browser tests skipped
  by their normal environment gate. 8 pressure form tests also passed (193 passing tests in total).
- Full `npm run lint`: passed, including 254 contrast checks and CSS token lint.
- `npm run seo:validate-sitemaps`: passed against the local app server.
- Shared `npm run typecheck`: account type errors from parallel work were fixed by their owner;
  remaining local failures concern conflicting pre-existing `.next/dev/types` and `.next/types`
  generated route validators. The isolated production build checks a clean generated type tree.

The verification harness in `tests/visual/nl-pressure` reuses the production sweep's isolated
snapshot and HTTPS server. It scans all 30 NL + 30 EN pressure landings and 12 Dutch calculator
paths (10 tools and two pressure aliases). Its English heuristic is derived from the
lead's `40-nl-scan-live.py`; it additionally checks localized metadata, canonical/hreflang and
fetch failures. The lead live baseline flagged all 30 landing pages: 780 findings.

Reproduce: `node tests/visual/nl-pressure/run.mjs`.
Evidence: `40b-local-scan.json` includes source hash/build ID and every checked URL.
Screenshots are not required for this copy scan and are not included in the manifest.

## Final local production result

- Isolated production build and clean generated TypeScript check: passed.
- HTTP scan: **72/72 URLs pass**, **0 fetch errors**, **0 metadata/canonical/hreflang errors**,
  **0 English-text findings**. The Dutch tire calculator alias follows its expected 308 redirect.
- Landing English findings: lead live baseline **780 across 30 pages → 0 across all 30 pages**.
- Build ID: `7YR8h-dFu0xlO4afBcsnc`.
- Source hash: `1c32649026b38e5942d9545e49da292b6682dd8a0178433769e03474e8597e80`.
- `git diff --check`: passed.

The first scan identified harness false positives, corrected before the final run: descriptions
use Dutch “achterdruk”, URLs are not prose, there is no calculator index route, and Python must
explicitly follow 308 redirects. No real page failures were ignored or allowlisted. The final
scan checks the HTML language as well. Its EN hashes are recorded for future runs; no historical
HTTP baseline comparison was claimed. EN preservation is covered by existing route tests and
the explicit migrated-dictionary comparison described above.

Local test logs: `/tmp/bbf40b-tests.log` and `/tmp/bbf40b-pressure-tests.log`.
Lint log: `/tmp/bbf40b-lint.log`. Build/server logs are in ignored
`plans/redesign-canvas/code-renders/40b-nl-scan/`. No screenshot files are listed.
