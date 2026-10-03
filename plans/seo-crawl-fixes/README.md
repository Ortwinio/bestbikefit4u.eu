# SEO crawl fixes (Screaming Frog, 2026-10-02)

**Goal:** fix the technical SEO findings so Google *and* AI crawlers (GPTBot, ClaudeBot, PerplexityBot,
OAI-SearchBot) get valid metadata, canonicals and reciprocal hreflang. **No visual or design change to any page.**

**Branch / worktree:** `fix/seo-crawl-issues` in `/Users/ortwinverreck/Developer/bestbikefit4u-seo`
(from `main` @ `6c6e66d`). Work only there. No commits, no deploy. Delivered as a PR by the lead.

**Skills (read first):**
- `/private/tmp/claude-501/-Users-ortwinverreck-Developer-bestbikefit4u/5aeb5663-a15e-4113-b5a8-357c9072ced2/scratchpad/fix-bestbikefit4u-technical-seo/SKILL.md` (+ `references/`)
- `/private/tmp/claude-501/-Users-ortwinverreck-Developer-bestbikefit4u/5aeb5663-a15e-4113-b5a8-357c9072ced2/scratchpad/improve-bestbikefit4u-ai-discovery/SKILL.md` (phase 2, not now)

## Root causes (verified by the lead on production, 2026-10-02)

### S1 — metadata outside `<head>` = Next.js streaming metadata (P0, 47 guides + 19 hreflang)
Fetching `https://bestbikefit4u.eu/en/guides/fit-science` with different user agents:

| User agent | title | description | canonical | hreflang |
|---|---|---|---|---|
| Googlebot | head | head | head | head |
| Screaming Frog SEO Spider | **body** | **body** | **body** | **body** |
| GPTBot | **body** | **body** | **body** | **body** |
| ClaudeBot | **body** | **body** | **body** | **body** |
| Chrome | head or body (timing) | | | |

Next 16 streams async `generateMetadata` output into the body for every user agent that is not in its
built-in "HTML-limited bots" list. The guide route's `generateMetadata` awaits CMS data, so the metadata
arrives after the head is flushed. The canonical and hreflang *do* exist; crawlers that don't run JS
or that only read `<head>` just don't see them. Which 47 URLs are hit depends on timing, so a per-page fix is wrong.
**Fix:** one config change, `htmlLimitedBots` in `next.config.ts`, so metadata is always blocking in
`<head>` for all user agents (e.g. `htmlLimitedBots: /.*/`). Confirm against the installed Next docs
(`node_modules/next/dist/docs` or the config type) and check for performance impact (TTFB on guide pages).

### S2 — two internal 404s (P1)
`/nl/bikefitting` (NL landing) and `/en/bike-fitting` (EN landing) are one page pair with **different slugs**.
The language switch (header + mobile menu = the 2 inlinks) maps the path 1:1, so it links to
`/en/bikefitting` (404) and `/nl/bike-fitting` (404). The hreflang of the pair is also wrong:
`/nl/bikefitting` only lists `nl` + `x-default` (to itself), with no `en` alternate.
**Fix:** a central mapping of pages whose slugs differ per locale, used by the language switch *and* the
hreflang/alternates generator. Add permanent redirects `/en/bikefitting → /en/bike-fitting` and
`/nl/bike-fitting → /nl/bikefitting` (they were live as link targets). Check for other routes with
locale-specific slugs (e.g. Dutch tire-pressure pages `bandenspanning/*`) and make them use the same mapping.

### S3 — hreflang on noindex login (P2)
`/nl/login`, `/en/login` and every `?src=` variant are `noindex, follow` with self-canonical to the clean
URL (keep that), but they emit `hreflang` en/nl/x-default. **Fix:** no `alternates.languages` on login
(and other noindex routes: email-preferences, account routes). Login stays out of the sitemap (it is).

## Tasks

| Task | Owner | Scope |
|---|---|---|
| **S1 + S2** | Codex A | `next.config.ts` (`htmlLimitedBots` only), language switch path mapping (`src/components/layout/*`, `src/i18n/switchHref.ts`, `src/i18n/metadata.ts`/navigation helpers), redirects for the two 404 URLs |
| **S3** | Codex B | login and other noindex routes' metadata (`src/app/(auth)/*`, `src/app/email-preferences/*`, account routes): drop hreflang, keep noindex + clean canonical; verify private routes (profile, fit results, report) are noindex or robots-disallowed |
| **S4 crawl check** | Codex C | `scripts/seo-crawl-check.mjs`: start the local production build, read all URLs from the sitemaps, fetch each with Googlebot, Screaming Frog, GPTBot, ClaudeBot and Chrome UAs, and assert per URL: HTTP 200, exactly one title/description/self-canonical inside `<head>`, reciprocal hreflang pairs (both sides, 200, indexable), no internal link (`href`) to a 404, login noindex without hreflang. Report JSON + short summary. Run it on `main` first (baseline, should reproduce the findings), then on the fix branch. |

Rules: no changes to visible UI, copy, layout or styles. `src/i18n/messages/nl.ts`/`en.ts` stay frozen.
Gates: focused vitest, `npm run typecheck`, `npm run lint`, `npm run build`, and C's crawl check green.
Notes in `plans/seo-crawl-fixes/audit/<task>-notes.md` and `audit/files-<task>.txt`. Print `DONE <task>`.

## S3 progress

B: login languages removed, clean login canonical and noindex/follow retained. Preferences gains
a clean canonical without languages. Private-route protections and hardening gaps reviewed.
50 focused tests, full typecheck and lint pass. See `audit/S3-notes.md` and `audit/files-S3.txt`.
No UI changes, commit or deploy. Shared build/crawl validation remains A/C's integration gate.

## Phase 2 (after release, not in this branch)

### S1/S2 implementation status
- A: fixes complete; 62 focused tests, typecheck, lint and final production build pass.
  Before/after local production measurement: 3/60 missing-head samples before, 0/60 after;
  both legacy landing URLs return 308 and canonical destinations return 200. No local TTFB increase.
  C's final crawl PASS: 1,145 page/UA checks, zero findings. Evidence:
  `audit/S1S2-notes.md`, `audit/files-S1S2.txt`, `audit/crawl-local-fixed.md`.
  No commit or deployment.
Content and AI discoverability per `improve-bestbikefit4u-ai-discovery`: direct answers, method and
assumptions, calculator links on the core guides; check claims; fixed NL/EN question set for
measurement. robots.txt currently allows all (`User-Agent: *`), so OAI-SearchBot and GPTBot are not blocked.

- 2026-10-03 — **C: DONE S4.** Production baseline captured and expected body metadata, two 404s,
  login hreflang and preferences canonical findings reproduced. Fresh local production build crawl:
  **1,145/1,145 checks pass; zero findings**, including all 96 linked fallback guide leaves.
  Eight parser tests, full lint/typecheck/build and diff checks pass. See audit/S4-notes.md,
  audit/crawl-prod-baseline.json, audit/crawl-local-fixed.json and audit/files-S4.txt. No commit/deploy.
