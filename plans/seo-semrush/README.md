# SEO improvement plan — Semrush audit 3 Oct 2026

Source: Ortwin's plan "SEO improvement plan — bestbikefit4u.eu (Semrush audit 3 Oct 2026)". Goal: trust signals,
complete coverage, performance data and answer-first content. **No visual redesign**; content additions follow the
existing house style and brand tone (`plans/redesign-canvas/reference/brand.md`). Never invent numbers, reviews or claims.

**Branch / worktree:** `fix/seo-semrush` in `/Users/ortwinverreck/Developer/bestbikefit4u-semrush` (from `main` @ `e93f8c1`).
Work only there. No commits, deploys or production data. Notes `audit/<id>-notes.md`, manifest `audit/files-<id>.txt`.
Gates: focused vitest, `npm run typecheck`, `npm run lint`, `npm run build`, `node scripts/seo-crawl-check.mjs --local`.

## Lead verification on production (3 Oct)
- `www.bestbikefit4u.eu/sitemap.xml` → **307** to the bare domain (temporary). Must be permanent (308/301) — Vercel
  Domains setting, Ortwin/lead, not code.
- Calculator JSON-LD: `aggregateRating 4.8 / 380` from the constant `CALCULATOR_AGGREGATE_RATING`.
- Homepage still shows "4,8", "380+ rijders" and "2.400+" — unbacked claims.
- `/en/faq` title is 79 characters. `llms.txt` is incomplete.

## Tasks

| ID | Prio | Scope | Acceptance |
|---|---|---|---|
| **S5 trust** | P0 | Remove `CALCULATOR_AGGREGATE_RATING` and every `aggregateRating` from JSON-LD (keep WebApplication + free offer). Remove homepage rating/"riders"/"fits completed" figures unless backed by real stored data shown on the page; replace with honest copy or `[CLAIM — bron?]`-free neutral text in the same layout. | No aggregateRating anywhere; no unbacked numbers on home; Rich Results structure valid; NL+EN; renders before/after of home (layout unchanged). |
| **S6 quick fixes** | P1 | FAQ title ≤ 60 chars EN/NL; replace the generic shared calculator link label with descriptive anchors; logo `alt="BestBikeFit4U"` (drop duplicate aria-label); `imageAlt` for EditorialLayout/ProfileWizardGuide illustrations (descriptive NL/EN; decorative stays `alt=""`); contact page ≥ 150 words (response time, what to include, links to FAQ + measurement guide; no invented promises); **not** the login `?src=` change: the R0 baseline (3–17 Oct) needs it for attribution; that item moves to after 17 Oct. | Tests per item; crawl check green. |
| **S7 sitemaps** | P1 | Blog sitemap always in the index (empty urlset valid); lastmod from real content dates, not `SITEMAP_SYSTEM_LASTMOD`; Convex calls in guide/blog sitemaps with timeout + static fallback; drop manual Content-Length. | Unit tests for empty, slow and failing sources. |
| **S8 llms.txt** | P1 | Generate `llms.txt` (+ `llms-full.txt` with the key answer per topic) from the same route source as the sitemap: all 11 calculators, all guides, science and pain pages, EN and NL. | Test fails when a public route is missing. |
| **S9 bike-fitting ownership** | P1 | One canonical EN and NL page for "bike fitting"; ≥ 5 internal links each (nav/footer/guides); decide `/nl/bikefitting` vs `/nl/fiets-afstellen` and canonicalize/redirect the other (propose in notes first if the choice is not obvious). | Crawl check green, no new 404/redirect chains. |
| **S10 performance baseline** | P1 | Lighthouse CI on 6 templates (home, a calculator, a guide, a pain page, pricing, login), mobile budgets LCP < 2.5 s, CLS < 0.1, TBT < 200 ms; Speed Insights per template; fix obvious levers (only the LCP image priority, `sizes` on next/image, font preload). | Report + tickets for anything above budget. |
| **S11 answer-first calculators** | P2 | Below each of the 11 calculators: direct answer, method in plain words with limits, worked example, common mistakes, FAQ (schema). Real engine values only. | EN + NL, text-to-HTML improved, no invented numbers. |
| **S12 authorship + methods** | P2 | Author/reviewer + review date on guides (needs Ortwin's real name/role — ask); methods page separating sources, practice and own rules; Organization schema with sameAs (only real profiles). | |
| **S13 tire-pressure pages** | P2 | Proposal: distinct content per weight page or consolidate per bike type with redirects. Decision by Ortwin. | |

Not code (Ortwin/lead): Search Console property + sitemap resubmission; Vercel www → bare domain permanent redirect;
full-site crawl (≈ 300 URLs) with free Screaming Frog (limit 500); link-earning assets; monthly AI-visibility check.

## S5 completed — 3 October 2026
Unsupported schema ratings and homepage trust claims removed; layout retained with neutral NL/EN guidance.
45 focused tests, typecheck, full lint, build and 1,145 local crawl checks pass. Eight before/after captures
are clean. See audit/S5-notes.md and audit/files-S5.txt. No commit/deploy. B continues R15 in rider worktree.

## S6 completed — 3 October 2026
Short FAQ titles, expanded bilingual contact help, descriptive shared guide-tool anchors, meaningful logo/
illustration alternatives and intentional decorative alternatives. Focused tests, full typecheck/lint/build
and 1,145 local crawl checks pass. See audit/S6-notes.md and audit/files-S6.txt. Login attribution unchanged.

## S7 completed — 3 October 2026
Always-present blog sitemap, bounded CMS reads, full local guide fallback, honest optional content dates,
and no manual Content-Length. Integrated C's canonical pressure provider and author/methods seeds.
68 Vitest + three validator tests, typecheck/lint/build and 880 local crawl checks pass. See audit/S7-notes.md
and audit/files-S7.txt. No commit/deploy. S8/S9 subsequently transferred to C and completed below.

## C progress — S10 and S11, 3 October 2026

S10 complete: reproducible six-template Lighthouse CI baseline and after run (36 samples), privacy-safe Speed Insights grouping, responsive image sizes. CLS/TBT meet budgets; six LCP violations remain explicitly ticketed. See `audit/S10-notes.md`, `audit/S10-comparison.md`, `audit/files-S10.txt`.

S11 complete: server-rendered NL/EN answers, methods, limits, actual-engine worked examples and common mistakes below all eleven calculators; matching visible FAQ schemas. 76 focused tests, full typecheck/lint, final production build, 1,145 crawl checks and 22 raw HTML route checks pass. See `audit/S11-notes.md`, `audit/files-S11.txt`. No commits/deployments.

## Decisions by Ortwin (3 Oct)
- **S12:** author is **Ortwin Verreck** on every guide ("Auteur: Ortwin Verreck" / "Author: Ortwin Verreck") with the
  real last-updated date. **No "reviewed by"/review date** unless Ortwin confirms he reviewed the guides. Person +
  Organization schema with name, site and logo; **`sameAs` stays empty** (no invented profiles — Ortwin asked for
  fictional ones, the lead declined because fake sameAs is misleading markup); keep one config list so real profiles
  can be added later in one line. Author page with name and "BestBikeFit4U" only until Ortwin supplies a bio.
  Methods page separating scientific sources, practice references and own rules (reuse /science structure).
- **S13:** option A — **consolidate** the per-weight tyre-pressure pages: one page per bike type (EN + NL) with an
  interactive/complete table for all weights using the real pressure engine; every old weight URL gets a **301** to its
  bike-type page (keep locale); remove them from the sitemap and internal links; no redirect chains; crawl check green.

## C completed — S12 and S13, 3 October 2026

S12: confirmed Ortwin Verreck authorship and real update dates on all guide article templates; no reviewer claims. Person/Organization schema share empty verified-profile lists. Minimal bilingual author page and sources/methods page are available. All 48 local article dates are preserved. See `audit/S12-notes.md` and `audit/files-S12.txt`.

S13: six canonical localized bike-type pages with complete real-engine pressure tables. Old weight URLs and aliases redirect directly with 301; B integrated sitemap removals/additions through the S7 source. 109 focused Vitest tests, two harness parser checks, full typecheck/lint, production build and 880 final crawl checks pass. Direct browser/HTML verification covers 6 tables, 65 redirects, 96 guide locales and 4 author/methods pages; eight local screenshots. See `audit/S13-notes.md`, `audit/files-S13.txt`, `audit/S12-S13-raw-html.json`. No commit/deploy.

Superseded concurrent-work note: the pending S8 llms module has now been completed by C after the lead reassigned S8/S9. Final typecheck and all gates pass.

## Extra tasks (lead, 3 Oct)
- **S14 AI-visibility question set (B):** `plans/seo-semrush/ai-visibility.md`: 20 fixed questions (10 NL, 10 EN) covering
  saddle height, frame size, stack/reach, bike fitting, tyre pressure, crank length, pain limits; a log table
  (date, assistant: ChatGPT / Claude / Perplexity / Google AI Overviews, language, mentioned yes/no, cited URL); short how-to.
  No results invented — the table starts empty. Print `DONE S14`.
- **S15 SEO branch integration (B, after C's DONE S8 + DONE S9):** full gates (typecheck, lint, test:unit, test:contracts,
  next build, Convex standalone tsc), `scripts/seo-crawl-check.mjs --local`, the Semrush check script, NL/EN 1440/390 sweep of
  the changed templates (home, calculators, guides, contact, FAQ, author/methods, tyre-pressure), before/after renders of
  visually touched pages (layout must be unchanged), release checklist incl. redirects to verify after deploy. Owners fix
  their own findings. Print `DONE S15`.

## B completed — S14, 3 October 2026

Fixed 20-question bilingual AI-visibility set, empty observation log and reproducible monthly procedure in
`ai-visibility.md`. Structural checks and independent review pass; no results invented or searches performed.
See `audit/S14-notes.md` and `audit/files-S14.txt`. S15 awaits C's DONE S8 and DONE S9; no integration gates started.

## C completed — S8 and S9, 3 October 2026

S8: both LLM discovery documents use the exact sitemap route source, with existing localized key answers and honest CMS fallbacks. S9: canonical bike-fitting pair retained, competing setup URLs 301 directly, shared footer and 48 guide sources per locale link directly.105 focused tests, full typecheck/lint/build,170-URL discovery parity, four redirect checks and 875 crawl checks pass. See `audit/S8-notes.md`, `audit/S9-notes.md`, their file manifests and `audit/S8-S9-runtime.json`. No commit/deploy. B can begin S15 integration.

## B completed — S15, 3 October 2026

Final post-S16 build `rejwcKGnhSNUclqs6ffwl` passes full typecheck/lint, 2,149 unit tests (20 skipped),
232 contract tests, standalone Convex tsc and production build. 875 crawl checks, Semrush/discovery and
local XML validation pass. All 84 final NL/EN 1440/390 captures have zero runtime/overflow/axe findings;
68 genuine baseline captures and the visual comparison are retained. On explicit lead authorization B
removed two unsupported test options on C's behalf, then repeated final gates and captures.
Six S10 LCP follow-ups remain OPEN. Notes, release checklist and manifest: `audit/S15-notes.md`,
`audit/S15-release-checklist.md`, `audit/files-S15.txt`. No commit/deploy; production approval remains the lead's.

## C completed — S16, 3 October 2026

Distinct localized accessible names on header/footer language navigation landmarks; no visible copy/layout change. 19 focused tests, full typecheck and scoped lint pass. B notified before/after for S15 rebuild and axe verification. See `audit/S16-notes.md` and `audit/files-S16.txt`. No commit/deploy.

## B completed — S17, 3 October 2026

SEO checkpoint rebased onto rider-profile main `4b22da0`; rewritten checkpoint `da723fb`.
Six conflicts resolved preserving rider handoff/personalization and SEO intent. Dashboard server/client
split and distinct header/footer language navigation remain intact. Follow-up tests/evidence are uncommitted.
All full gates pass: 2,966 unit tests (20 skipped), 477 contract tests, typecheck, lint, production build,
standalone Convex tsc. Local crawl (875 checks), Semrush and discovery checks pass. All 84 NL/EN
1440/390 sweep cases are clean; 45 changed images reviewed and 39 identical S15 images retained.
Six S10 LCP follow-ups remain OPEN. See `audit/S17-notes.md`, `audit/S17-gates.md`,
`audit/S17-visual-notes.md` and `audit/files-S17.txt`. No push, deployment or separate fix commit.

## C completed — S18, 3 October 2026

Fixed audit-tooling URL checks with parsed origin/pathname comparisons and fixture exception responses with the shared generic-error helper. Both affected runtime scripts, shared error-handler tests and full lint pass. No suppressions, commits or deployment. See `audit/S18-notes.md` and `audit/files-S18.txt`; hosted CodeQL confirmation awaits the next PR run.
