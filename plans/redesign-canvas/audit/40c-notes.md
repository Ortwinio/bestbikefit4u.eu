# 40c — Dutch guide titles and marketing copy

## Scope and changes

- One Dutch guide-title dictionary now supplies fallback guide headings, hub cards, metadata titles and named internal links. Related lists no longer title-case English slugs. Existing English title generation stays unchanged.
- Dutch metadata summaries remove mixed setup/power/hood terminology. Guide prose, quick answers and generated CTA sentences use the Dutch titles and owner-local dictionaries. Fixed the reported saddle-height sentence and related lower-back/tall-rider links.
- Canonical Dutch guide names also apply to home cards, footer, FAQ, blog related links, editorial/science lists, and known guide links inside guide markdown/FAQ answers. Action-only links such as “Lees de gids” and language-switch links keep their purpose-specific text.
- Guide CTA “Start Free Fit”, preview controls, FAQ headings and breadcrumb aria-label are localized. Breadcrumb styling now targets a stable data attribute rather than an English aria-label.
- Audited home, header/mobile menu, footer, pricing, how-it-works, measurement guide, fit pass, pain pages, about, FAQ, contact, legal, blog, science, why-bikefit-matters, bikefitting and fiets-afstellen. Fixed remaining mixed copy in their marketing dictionaries without changing English branches.
- Case-study metadata, consent, success/error toasts and native form validation now use Dutch copy. English error/native-validation behavior is unchanged. Product names Free, Pro and Fit Pass remain product names.
- Three subagents covered non-guide marketing, blog/science, and guide prose. Parent owns shared title resolution, guide metadata/markdown, integration and final checks.

## Verification

- 136 tests across 19 focused suites passed after guide/marketing fixes. Final breadcrumb/guide/layout regression run: 28 tests across five suites pass (overlaps the first run). Full `npm run lint`, `npm run typecheck` and `git diff --check` pass.
- 102 authored English property blocks across guide content families and quick answers compared byte-for-byte against HEAD: unchanged. Tests additionally assert English title generation, CTAs, form errors, metadata and navigation.
- Browser audit: `node tests/visual/marketing-nl/check.mjs`. Uses an isolated production snapshot, NL at 1440/390, all backlog guide pages plus marketing routes. Full results: `40c-browser.json`. No production/CMS writes or form submissions.
- Guide link checks exempt intentional action labels and language-switch links; every named link must include the canonical Dutch guide title. The first pass found additional CTA/prose/validation leaks, which were fixed before the final run.
- Browser English detection is heuristic, not a claim that every flagged word is English. Dutch “last”, “smaller”, “millimeters”, “professional” and “Export”, and product names Free/Pro are reviewed exceptions.
- Final browser result: **68 routes × two widths = 136 successful cases**, all HTTP 200, zero named-guide-link mismatches, zero English guide-title/“Start Free Fit” matches and zero English native-validation candidates. Source snapshot `3500279904ecf2f89e7ecd420102dd0df70a90b7d5e113539cdb119ce9c61746`.
- The supplied live baseline identified 37 findings across 20 guide pages. Final heuristic scan has 26 distinct candidates across the wider marketing scope: 25 reviewed Dutch/product-name exceptions and the one shared “Notifications” label described below. No zero-findings claim is made for the raw heuristic.

## Boundaries and remaining dependency

- The shared toast viewport still exposes aria-label “Notifications” on NL pages. This is shared UI/root-layout ownership; A did not edit it. Handoff: `messages/20260930-40c-to-lead-shared-toast-label.md`. Own marketing toast messages are translated.
- CMS content retains its existing fallback behavior when Dutch content is missing; no confirmed missing-NL live blog post was found, and no CMS content was fabricated or mutated. Unknown CMS categories remain editorial data. Known guide slugs use the Dutch dictionary; unknown NL guide links show “Gids” rather than an English slug.
- `/nl/bike-fitting` is intentionally unavailable; the Dutch landing route is `/nl/bikefitting`. There is no `/science` index route; the science hub is `/guides/fit-science`, alongside the three science detail pages. These are not translation regressions.
- Frozen `src/i18n/messages/nl.ts` and `en.ts`, calculator/account files and shared UI are untouched by 40c. Legal wording is preserved. No invented factual claims, commit, push or deployment. Exact files: `files-40c.txt`; no PNGs.
