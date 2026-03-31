# Sprint: Claim Sync, Analytics & Pain Pages

**Status:** Ready for execution
**Created:** 2026-03-31
**Sprint length:** 2 weeks
**Priority:** P0 — blocks first paid conversions

---

## Goal

Ship a sprint where:
1. Nothing published can cause a refund request or legal complaint.
2. Every euro spent on ads is measurably attributed to a conversion.
3. Five pain-symptom pages are live and indexed for the highest-intent organic queries.

---

## Background

A commercial and technical audit identified three blockers to first paid conversions:

**Commercial claim mismatches** — The pricing page shows USD prices on a `.eu` domain and lists six unbuilt features (PDF export, API access, client management, team collaboration, custom integrations, branded PDFs) as active Pro/Premium entitlements. Any user who pays and finds these missing will request a refund.

**Analytics pipeline unverified** — `GTMConsentLoader`, `TrackedCtaLink`, and `MarketingEventTracker` are all implemented in code but there is no confirmed evidence that GA4 receives events or that conversion signals reach Google Ads or Meta. All paid acquisition is currently unattributable.

**Thin pain-page coverage** — "Cycling knee pain", "back pain on bike", "hand numbness cycling" are high-intent queries with clear conversion paths to a fit sign-up. Currently the site has two guides but no symptom-first pain pages. Five pages, using a consistent template, closes this gap.

---

## Scope

### In scope

| Ticket | Area |
|--------|------|
| T01 | Pricing — fix currency to EUR |
| T02 | Pricing — gate unbuilt features |
| T03 | Analytics — verify end-to-end event pipeline |
| T04 | Analytics — ad conversion setup (Google Ads + Meta) |
| T05 | SEO — sitemap, canonical, hreflang audit |
| T06 | Copy — fix health and scientific claim language |
| T07 | Pain pages — template and data model |
| T08 | Pain pages — first 5 pages |
| T09 | Case study — recruitment flow |

### Out of scope

- Implementing PDF export (requires separate sprint)
- Building API access or client management (Premium tier)
- Payment/billing integration
- Strava phase 2+ features

---

## Execution order

```
Week 1:
  Day 1–2: T01, T02, T06 (copy and claim fixes — deploy immediately)
  Day 2–3: T03 (analytics verification — blocks T04)
  Day 3–4: T04 (ad conversions — depends on T03)
  Day 4–5: T05 (SEO audit — blocks T08 launch)

Week 2:
  Day 1:   T07 (pain page template and data model — blocks T08)
  Day 2–3: T08 (first 5 pain pages)
  Day 3–4: T09 (case study recruitment flow)
  Day 5:   QA pass, smoke test, deploy
```

---

## Acceptance criteria (sprint level)

- [ ] No `$` currency symbol on any public page (`grep -r '\$[0-9]' src/app/\(public\)/`)
- [ ] No unbuilt pricing feature listed without a "Coming soon" label
- [ ] GA4 DebugView shows all 5 core funnel events in staging
- [ ] Google Ads test conversion fires on sign-up in staging
- [ ] Google Search Console shows zero sitemap errors within 48 hours of deploy
- [ ] Zero direct health outcome claims on homepage
- [ ] 5 pain pages live, all included in sitemap
- [ ] Case study leads writing to Convex and internal email fires

---

## Prompt files

| File | Ticket |
|------|--------|
| `01-currency-and-claim-fixes.md` | T01, T02 |
| `02-copy-health-claim-fixes.md` | T06 |
| `03-analytics-verification.md` | T03 |
| `04-ad-conversion-setup.md` | T04 |
| `05-seo-sitemap-canonical.md` | T05 |
| `06-pain-page-template.md` | T07 |
| `07-pain-pages-content.md` | T08 |
| `08-case-study-flow.md` | T09 |

---

## Open risks

| Risk | Severity | Owner |
|------|----------|-------|
| Payment provider not configured — upgrade conversion event (T04) has no reliable signal without billing integration | High | Scope T04 to sign-up only; plan billing sprint separately |
| Dashboard PDF button state inconsistent with pricing page after T02 — Pro users will see "coming soon" on pricing but different state in dashboard | High | T02 execution must also patch the dashboard results page PDF button |
| Duplicate content: new pain pages vs existing pain guides — without clear canonical relationship Google may split authority | Medium | T07 must define canonical strategy before T08 publishes |
| GTM container ID missing from production Vercel environment — all analytics work is a no-op until this is set | High | Verify before starting T03 |
| NL translations for pain pages — blocks hreflang for NL locale | Medium | Ship EN-only with hreflang `en` declared; add NL as follow-up |
| Case study GDPR compliance — collecting name and email for marketing requires explicit consent | High | T09 must include a consent checkbox; do not pre-tick |
