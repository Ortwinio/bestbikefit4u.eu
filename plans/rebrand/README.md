# Rebrand BestBikeFit4U → BikeFitBoost (release, live directly after review)

**Brand book:** `canvas/bikefitboost-merkblad.md` (authoritative). **Logo design:** canvas boards in `canvas/`
(`BikeFitBoostLogos*.dc.html`); the chosen mark is **variant 1.3.6 "Badge"** in `BikeFitBoostLogos4.dc.html`
(line bike tilted 10° on a lime circle, three speed streaks shooting out left) and favicon "F" (tilted wheels + streaks)
from the same board. Wordmark per merkblad: "BikeFit" + "Boost" in Bricolage Grotesque 800. Always written **BikeFitBoost**.
The official `bikefitboost-logoset.zip` is not available yet: build the set from the canvas SVG yourself, with
exactly the file names of merkblad §12, under `public/brand/` (+ favicons in `public/`), so the zip can later drop in 1:1.

**Branch / worktree:** `feature/rebrand-bikefitboost` in `/Users/ortwinverreck/Developer/bestbikefit4u-rebrand` (from main
@ 369a8d0). Work only there. No commits, deploys, production data or sent mails.

## Fixed decisions
1. **Domain becomes `www.bikefitboost.com`** (Ortwin, 3 Oct; already attached in Vercel: apex 308 → www, www serves
   the site). Ignore the merkblad's ".eu" — it is **.com** everywhere (og:image, manifest, JSON-LD, llms.txt, sitemap,
   robots, canonical/hreflang, `metadataBase`, email logo URLs, PDF footer). Put the origin in ONE config constant
   (`https://www.bikefitboost.com`, env-overridable). Add **301/308 redirects** for `bestbikefit4u.eu` and
   `www.bestbikefit4u.eu` → same path on `https://www.bikefitboost.com` (host-based redirect in `next.config.ts`; test it).
   CSP/allowed hosts: add the new host, keep the old one until the redirect is proven. Auth: magic-code links must use the
   new origin — list every env var that holds the site URL (Convex `SITE_URL`, Vercel `NEXT_PUBLIC_*`) in
   `audit/RB-env-switch.md`; the lead changes env at release, you never touch env. **Email addresses stay
   `@bestbikefit4u.eu`** (changed later) — sender display name becomes "BikeFitBoost".
2. **No old BestBikeFit4U elements next to the new logo** (merkblad). Old logo files/components are removed or no longer
   referenced; old name only remains where it is a URL/host/email address/storage key/cookie name/DB identifier
   (never rename persisted keys — list them in the notes).
3. Colours and fonts are unchanged (`--bfb-*` tokens).

## Tasks
| ID | Scope |
|---|---|
| **B1 logo set + head** | SVG variants (horizontaal, -negatief, -zwart, -wit, gestapeld, -negatief, beeldmerk ×4), PNGs (via Playwright/sharp render: horizontaal 480/960 licht+negatief, beeldmerk 256/512/1024, `png/logo-horizontaal-960.png` for email), favicons (ico 16/32/48, svg, 16/32 png, apple-touch, android-chrome 192/512, maskable-512), `site.webmanifest` (name BikeFitBoost, theme `#0F2420`), `og-image-1200x630.png` + svg. Head code per merkblad §11 (theme-color, og:site_name, og:image — on the current domain). |
| **B2 site-wide rename** | Header (horizontal logo, 34 px), footer + dashboard sidebar (negative, 34/32 px), login (stacked), all NL/EN i18n copy, page titles/meta templates, JSON-LD Organization/WebSite name+logo, `llms.txt`, PDF report header/footer + filename prefix (new reports `bikefitboost-report-…`), guides/CMS template strings, FAQ, legal pages (name only — flag legal entity text for Ortwin, do not invent), alt texts, `aria-label`s, tests/fixtures/snapshots. Old brand copy in CMS guide content in Convex: list them (count + ids) in the notes; do not change production data. |
| **B3 emails** | Every template in `convex/emails/templates` and auth/magic-code mails: header logo (`png/logo-horizontaal-960.png` at 172×30, absolute URL on current domain), name in subject/preheader/body/footer NL+EN, sender **display name** "BikeFitBoost" (address unchanged). Regenerate previews (`scripts/render-email-previews.mjs`) and check every one. Report a table mail → status. |
| **B4 canvas-vs-site audit** | Compare every board in the canvas snapshot `/Users/ortwinverreck/Developer/bestbikefit4u/plans/redesign-canvas/canvas/` (and `canvas-bfb/project/canvas.json` for the current board list) with the live-equivalent local pages at 1440 and 390, NL/EN. Output `audit/B4-canvas-gaps.md`: per board implemented / deviates (what) / missing. Exclude boards of the pricing-v3 release (Abonnement afsluiten, Pricing, mails M04/M08/M10/M13) and 2.1 gifts — those are in another branch. Fix small visual deviations in this branch only if clearly brand-related; list the rest. |
| **B5 guard** | Test that fails when "BestBikeFit4U"/"bestbikefit4u" appears in rendered copy, i18n, emails or metadata (allowlist: domain/host/email/persisted keys). |

## Gates
`npm run typecheck`, `lint`, `test:unit`, `test:contracts`, `build`, Convex tsc, `scripts/seo-crawl-check.mjs --local`,
email previews, 1440/390 NL/EN screenshots of home, header/footer, dashboard sidebar, login, PDF report, one guide —
in `renders/` (git-ignored, never commit). Notes `audit/<id>-notes.md`, file manifest `audit/files-rebrand.txt`.
Print `DONE RB` when all done.

## Execution — 4 October 2026

B1–B5 implemented and audited with disjoint asset, site/PDF, email and integration workers. Final
source gates pass: typecheck, lint/brand guard, 2,986 unit tests (20 existing skips), 478 contracts,
Convex standalone tsc, production build and 875 local crawl checks. Both legacy hosts preserve deep
paths and queries in permanent redirects; 23 final-build HTTP/head/icon/manifest checks pass.

The 320-case NL/EN 1440/390 sweep has zero brand, runtime, overflow, image or axe findings. Five
non-brand language-heuristic/touch-target findings and canvas differences remain explicitly listed
in `audit/B4-canvas-gaps.md`; they are not silently changed by a rebrand. All current email templates,
targeted brand surfaces and twelve actual report PDF pages have local visual evidence.

Release handoff: `audit/RB-notes.md`, `audit/RB-env-switch.md`, `audit/files-rebrand.txt`. Ortwin still
owns environment/domain/provider switching, legal-entity confirmation and any authorized production
CMS inventory/update. No commits, deployments, production access or sent emails were performed.

## RB2 follow-ups — 4 October 2026

After explicit PR #14 merge authorization, RP6 result wrapping and the contact measurement-link target
are fixed. N07Dag7 and N14Dag14 have pure NL/EN renderers and local previews only; no sender or schedule
is wired. The full source gates, 875 local crawl checks, 12-case UI sweep, targeted before/after geometry
and 52 email previews pass. See `audit/RB2-notes.md` and `audit/files-RB2.txt` for proof and limitations.
Other B4 gaps are not marked resolved. Work remains uncommitted for lead review.
