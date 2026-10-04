# C1 independent conservative reference audit

Date: 2026-10-04. Scope: read-only dependency review in `bestbikefit4u-migratie`; this report is the only file changed by this worker. No files deleted, no commits, no production queries, environment changes or mail. Findings describe the tree at scan time; coordinate with C3 before removing any consumer.

## Method

- Read repository AGENTS.md, CLAUDE.md, cleanup README and existing plans README. No nested AGENTS.md exists under plans. Context index describes completed February work; messages has only README/TEMPLATE.
- Searched hidden repository text excluding Git internals/node_modules for plan directory names, standalone filenames, filesystem reads/writes, interpolated paths, and directory enumeration. Inspected scripts, tests, Convex, source, workflows, package scripts, Next config, guide import data and public brand provenance.
- Distinguished runtime/test input, generated output, policy/provenance and historical plan-to-plan references. A filename-only search is insufficient for directory enumeration and interpolation.
- Parsed all 48 rewrite guide JSON documents. Checked raw text and JSON syntax in the 62 legacy CMS import documents. Did not inspect production data; the task explicitly prohibits production access.

## Loose files

| Path | Recommendation | Evidence |
| --- | --- | --- |
| `plans/xml-sitemap-implementation-plan.md` | Delete candidate | Whole-repository exact-basename search has no incoming references. Describes historical sitemap implementation; no script/test/config reads this file. |
| `plans/BestBikeFit4U_Redesign_Plan.docx` | Delete with historical consumers | Incoming references are `plans/homepage-redesign/README.md:3` and `plans/redesign-canvas/README.md:160`. Homepage README says implemented/validated; redesign README explicitly supersedes the document's blue/Inter palette. No operational reader found. |
| `plans/tmux-ide-minimal-operating-convention.md` | Keep unless policy and links are deliberately migrated | This is live operating policy, not a historical execution plan. Root `README.md:40` and plans README link to it; AGENTS.md explicitly recognizes standalone policy documents. Removing it without updating links would break active instructions. |
| root `audit.md` | Historical deletion candidate; coordinate C3 ownership | It states the Prototyper migration is complete. Exact standalone filename references are in the historical `plans/refactor-prototyper-ui-audit-remediation` plan; no executable consumer found. |
| root `AGENTS.md`, `CLAUDE.md`, `README.md`, `SECURITY.md`, `PRODUCT.md` | Keep | Explicit cleanup exclusions. These plus audit.md are the actual root Markdown inventory; the DOCX and two loose plans are under plans/. |

## Inputs requiring retention or an explicit consumer migration

| Input | Consumer and evidence |
| --- | --- |
| All 48 `plans/redesign-canvas/guides-import/*.json` | `scripts/import-guide-rewrites.mjs:129` enumerates the directory and asserts exactly 48 documents. `convex/guides/__tests__/mutations.contract.test.ts:182` enumerates every JSON. Source guide/SEO tests interpolate filenames by slug: `src/lib/guides/rewrites.test.ts`, batch A/B/D tests, and `src/lib/seo/social-image.test.ts`. Keeping only the visibly literal tall-riders filename is insufficient. |
| `plans/redesign-canvas/canvas/FitRapport1.dc.html` through `FitRapport6.dc.html` | `tests/visual/pdf-report/board.test.mjs:12` and `render.mjs:164` build filenames from loop numbers. These six are mandatory inputs while those consumers remain. |
| `plans/redesign-canvas/audit/route-map.md` | Direct read in `tests/visual/final-sweep/routes.test.mjs:20`; sweep metadata and README also identify it as inventory. |
| `plans/seo-semrush/audit/S9-internal-links.json` | `scripts/seo-discovery-check.mjs:87` reads it and derives pages to fetch from `locales[locale].contextualSourcePages`. |
| `plans/redesign-canvas/audit/47-optimized.json` and corresponding illustration originals | `tests/visual/image-weight/capture.mjs:13` loads the manifest, filters records, then reads `illustration-sources/originals/${row.original}`. Preserve manifest and tracked sources if consumer remains; originals are already ignored/untracked in this checkout. `scripts/convert-hero-video.sh:21` also names the archived home GIF. |
| `plans/redesign-canvas/drafts/_renders/{Guides,GuideDetail,BlogIndex,BlogArticle,About,FAQ,Contact,CaseStudy}.png` | Marketing batch3 and batch5a captures construct board PNG paths with concatenation/interpolation and copy them. Git lists no tracked files under this ignored directory, so missing inputs are pre-existing, not introduced by cleanup. Do not claim these consumers are independent of plans. |
| `plans/seo-semrush/audit/S10-{before,after}/summary.json` | `scripts/performance/compare.mjs:3-5` joins shared directory and filenames. Both paths are ignored/untracked; producer is performance/run.mjs. Preserve workflow or relocate both producer and consumer together. |
| Prior audit JSON/report outputs | `tests/visual/guides-audit/review.mjs` reads `${path}.json`; guides-audit/audit.mjs can resume from `${output}.json`. `final-sweep/nl-reanalyze.mjs` reads report.json/cases.jsonl from an output directory. These support re-analysis/resume and cannot all be described as write-only. |

## Output directories and documentation dependencies

- `scripts/riderprofile-baseline.mjs:92` writes `plans/riderprofile-baseline/baseline-${fromLabel}-${toLabel}`. Keep this workflow for the scheduled 18 October baseline. Generated historical evidence is distinct from the future output destination.
- `scripts/seo-crawl-check.mjs:115` writes `plans/seo-crawl-fixes/audit`; retain the destination contract or migrate it and test the checker.
- `scripts/domain-migration-check.mjs:113` writes `plans/migratie/audit`, which is explicitly retained.
- Many visual tools create `plans/redesign-canvas/code-renders`, audit files or final-sweep outputs. Guide batch exporters create guides-import JSON and generated source title files. Their ability to create output directories does not justify removing separate input fixtures.
- `public/brand/LEESMIJ.md:3` identifies `plans/rebrand/canvas/bikefitboost-merkblad.md` as brand provenance; keep or migrate that referenced policy unless deliberately updating the documentation.
- `convex/emails/i18n/{en,nl}.ts` cites `plans/emails-bilingual/SPEC.md` as literal copy provenance; `src/lib/public-calculators/performance.ts:9` cites `plans/redesign-canvas/05-new-tool-contracts.md`. These are source comments, not filesystem reads, but should be recorded as references rather than reported as absent.
- Hidden `.tasks` dispatch/history and context/INDEX.md link old plans. They are historical metadata, not stronger authority than current plan status; document stale references if removing their targets.
- CI only checks changed plan step filenames have accompanying README changes; it does not load historical plan contents.

## CMS/public reference cross-check

- The 48 rewrite documents contain 96 unique matched hero/OG asset references and no `plans/` string values. Preserve the JSON as tests/import inputs and preserve their public assets. Asset URLs include `/illustrations/guides/*.webp` and `https://www.bikefitboost.com/og/illustrations/guides/*.jpg`.
- The 31 EN and 31 NL legacy documents under `docs/cms-import` contain no `plans/` references. `scripts/import-guide-json.ts` constructs that directory from separate `docs`, `cms-import`, locale path segments, enumerates JSON files, and can copy images to `public/guides/media`. Do not confuse these documents with obsolete plans.
- Pre-existing syntax issue: `docs/cms-import/en/016-en-guides--rider-profiles.json` fails JSON.parse; all other legacy files parse. Raw-text reference scanning still included this document. No repair attempted under this scope.
- `scripts/images/generate-social.mjs` enumerates public illustration/media directories and derives `/og` JPEG paths by replacing suffixes; asset safety cannot be established only by searching each full output filename. Production CMS contents were not queried.

## Proposed plans README update

Use CLAUDE.md's folder convention: one descriptively named project folder; README containing goal, optional background, scope/out-of-scope, approach and acceptance criteria; self-contained numbered prompts executed in order; update README progress after each step; post blockers under messages. Retain AGENTS.md's preferred feature-/bugfix-/refactor- prefixes and standalone policy exception. Explain that cleanup/ and migratie/ are retained active folders, while additional retained paths are operational fixtures/output contracts, not unfinished historical projects. Link the live tmux policy with a relative path and explain that completed historical plans may be removed only after dependency checks.

Validation: static reference scan and JSON syntax checks only; no application tests run by this worker and no deletion approved merely from this report.
