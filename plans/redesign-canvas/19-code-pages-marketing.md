# 19 — Phase 6d: build the marketing & content pages (after 18)

**App code, don't commit** (the lead reviews per batch). Same rules as 18: the real content stays (CMS/i18n/metadata/JSON-LD/canonicals), only the presentation follows the board, and NL + EN go through the dictionaries.

## 0. Shared layout
- `Header` per the approved content boards (`drafts/HowItWorks.dc.html`): logo, Calculators/Hoe het werkt/Gidsen/Prijzen, the NL/EN pill, "Inloggen" as a text link, and the primary pill "Start gratis bike fit". Mobile: the existing mobile menu restyled.
- `Footer` per the same board (ink, negative logo, the real columns). Replace the colored legacy calculator icons in the footer with brand stroke icons.

## Batches (3–4 pages each, print `DONE 19.N` and wait for approval)
1. `/` (home ← `canvas/Main.dc.html` after 11), `/pricing` (← `canvas/Pricing.dc.html` after 11; payments paused = the real state), `/how-it-works`.
2. `/measurement-guide`, `/fit-pass`, `/pain`, `/pain/[slug]`.
3. `/guides`, `/guides/[slug]`, `/blog`, `/blog/[slug]`.
4. `/why-bikefit-matters`, `/bike-fitting` + `/bikefitting`, `/fiets-afstellen`, `/science/*`.
5. `/about`, `/faq`, `/contact`, `/case-study`, `/privacy`, `/terms`, `/tire-pressure/[slug]` + `/bandenspanning/[slug]`.

Home: keep the claims on the home page only if they're verified per `audit/11-notes.md`. Otherwise use the placeholder approach from the board, as a **visible TODO in code** (a comment plus leaving the claim out). Never publish a placeholder as text.

## Per batch: done when
typecheck/lint/test:unit/test:i18n/build pass; screenshots 1440 + 390 in NL (+ 1 EN page) next to the board render; `npm run seo:validate-sitemaps` green; `audit/19-notes.md` updated.
