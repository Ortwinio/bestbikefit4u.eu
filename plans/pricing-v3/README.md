# Pricing model v3 — release 2.0 (without the Stripe integration itself)

**Spec:** `RELEASEPLAN.md` (Ortwin, 3 Oct 2026). **Design:** canvas page "Abonnement afsluiten" (`boards/afsluiten/*`,
`boards/afsluiten/m/*`) plus the boards updated for this release in `boards/` (Pricing, Dashboard, Profile, Settings,
Bike*, FitPass, FitResults, FitReport, History, ProfileImprove, FAQ, Main, RP4/5/7/8, RPSidebar, `m/*`) and mails in
`boards/mail/` (M04, M08, M10, M13 Overgang, Bouwstenen). Build the boards as designed; the "Ontwerpstaat" strip is review-only.
Canvas: https://claude.ai/artifact/87PNyNszcNRjBZBX9ZT3oX. Placeholders in the boards (`[LOCATIE]`, `[DUUR AFSPRAAK]`,
`[VOORWAARDEN AFSPRAAK — juridisch toetsen]`) stay visible placeholders — never invent them.

**Branch / worktree:** `feature/pricing-v3` in `/Users/ortwinverreck/Developer/bikefitboost-pricing` (rebased onto `origin/main` @ `3f3112d6` for P5).
Work only there. No commits, deploys or production data. One PR, released only after Ortwin's go.

## Ortwin's decisions (3 Oct)
1. **Scope = release 2.0 only.** Cadeaus (2.1: Cadeau/CadeauOntvangen boards, M11/M12, Trustpilot, aanbodmails) are NOT built.
   Pricing page and checkout do not mention gifts — except where the 2.0 boards literally show "2 losse metingen om weg te
   geven" as a product feature (follow the board; note it).
2. **No Stripe integration yet.** Everything works except the actual Stripe call: wherever Stripe would be called
   (checkout session, customer portal, cancel/refund at Stripe, webhooks), a single shared module throws/returns a
   clear `STRIPE_NOT_IMPLEMENTED` result and the UI shows: NL "Betalen via Stripe is nog niet geïmplementeerd. Je keuze is
   bewaard; we laten het je weten zodra afrekenen kan." / EN equivalent. No real Stripe keys, products or calls.
3. **Gating behind a flag, OFF in production.** New flag `isPaidAccessEnforced()` (server + client, default `false`,
   env `PAID_ACCESS_ENFORCED`/`NEXT_PUBLIC_PAID_ACCESS_ENFORCED`). Off = today's behaviour (full report, full profile), but
   the new pricing page and checkout flow are live (ending in the not-implemented message). On (preview/local/tests) =
   full 2.0 behaviour: free sees core values, profile score capped at 80 %, paid fields refused server-side, report/PDF gating.
   Keep `isStripeBillingEnabled()` semantics from the plan's rollback section.

## Products (prices incl. VAT, from RELEASEPLAN)
Gratis €0 (kernwaarden, profiel tot 80 %, 1 fiets) · Losse meting €13,50 (1 fiets, 3 maanden) · Jaarabonnement €24,50 eerste
jaar, daarna €19,50 ("Favoriete keuze", alle fietsen, 12 maanden) · Instap na losse meting €13,50 eerste jaar, daarna €19,50 ·
Jaarabonnement + persoonlijke bikefit €234,50 eerste jaar, daarna €19,50. **No €9, €12,50 or "/ maand" anywhere in code.**

## Tasks

| ID | Owner | Package | Scope |
|---|---|---|---|
| **P1 entitlements** | Codex A | A + C + transition | Convex products + entitlement model per user and per bike (losse meting = 1 bike, 3 months; year = all bikes 12 months; personal fit = year + appointment entitlement; instap eligibility after a losse meting); daily cron that drops expired entitlements to free; shared `getAccess(user, bike?)` helper for UI and server; `isPaidAccessEnforced()` flag; profile score cap (free fully filled = exactly 80 %, paid fields refused server-side when enforced, complaint fields always editable) on top of the existing `shared/profileScore`; existing reports marked "gemaakt met volledige toegang"; transition: existing accounts with ≥1 report get one free losse meting (3 months valid, use within 2 months after go-live) — implement as an admin-triggered, dry-run-first internal mutation, not automatic. Write `messages/A-contract.md` first. |
| **P2 checkout + pricing + report gating UI** | Codex B | E + D + H | Pricing page NL/EN (board Pricing) with three cards side by side (losse meting \| jaarabonnement \| jaar + persoonlijke bikefit), year in the middle, tallest, ink with lime price and "Favoriete keuze" badge; stacked on mobile with the year first; structured data per the SEO rules (no aggregateRating). Distraction-free checkout per `boards/afsluiten` (Kies → Account → Bevestig → Gelukt / Mislukt; no main menu/footer; max 3 benefits; one primary action; VAT-inclusive price always visible; withdrawal checkbox required before "Betaal"; entry from Pricing and under the free fit result). "Betaal" calls the Stripe stub → not-implemented message. Gelukt/Mislukt states reachable for tests/preview. Report/PDF gating UI per FitResults/FitReport boards (free: core values + PDF of the latest report; losse meting opens only that bike). Personal bikefit after-payment "Plan je afspraak" block with a configurable agenda link (`[AGENDALINK]` placeholder until set) and fitter notification hook (no real mail address invented). Settings: subscription overview, opzegknop (calls the stub), restitution-to-rato text. Update Dashboard/Profile/Bike*/History/FAQ/Main per their updated boards. Write `messages/B-ui-plan.md` early. |
| **P3 Stripe stub + mails + copy cleanup** | Codex C | B (stub) + F | One module `src/lib/billing/stripeStub.ts` (+ Convex counterpart if needed) used by every Stripe call site (existing `/api/stripe/checkout`, `/api/stripe/portal`, webhook route, cancel/refund) returning `STRIPE_NOT_IMPLEMENTED`; keep the webhook route present but inert and safe. Five service mails NL/EN in the house-style email system (`convex/emails/templates`): aankoop, welkom, looptijd voorbij, verlengherinnering (shows €19,50 and "€5 korting"), opzegbevestiging; plus M13 Overgang (transition announcement, service mail) and updated M04/M08/M10 per their boards; no sending wired to real purchases yet except via test fixtures; previews in `scripts/render-email-previews.mjs`. Remove every €9 / €12,50 / "/ maand" / old Pro-monthly reference (code, i18n, llms.txt, structured data, FAQ); tests that fail if they return. |

Coordination: A's contract first (`messages/A-contract.md`), B and C build against it. Disjoint files; cross-owner needs via
`messages/`. Use subagents in parallel. Do not borrow other team agents.

## P2 pricing worker progress — 3 October 2026

### P2 complete — final v3 acceptance

Pricing/checkout/report/appointment/settings and account board updates are complete. Enforcement remains OFF
by default; Stripe is a stub. Final shared source: typecheck/lint PASS,3,323 unit tests PASS (20 skipped),490
contracts PASS, Convex tsc PASS, build6KW82hm49ljNYI1ddtwmm PASS, local crawl875 checks/zero findings.
The200-case NL/EN ×1440/390 ×OFF/ON sweep and all300 PNGs pass automated and manual review; exact hash
coverage and fixture limitations are documented. B took over the last CSS-only rebuild after C completed P3.
Compiled disk CSS was independently byte-verified against a repaired local HTTP preview, not dev CSS.
This final acceptance supersedes the earlier pending P1/P3 visual notes, including C's stale pre-completion
stub screenshot: its complete final notice is visible, and pinned-action gutters are verified. Notes
`audit/P2-notes.md`, gates `audit/P2-gates.md`, files `audit/files-P2.txt`, renders `renders/p2-visual/`.
No commit, deployment, production-data operation, payment or mail. Business/agenda/legal placeholders remain.

Pricing page/card/dictionary complete against A's canonical products: NL/EN, annual centered/tallest desktop and first mobile, VAT, checkout links, comparison/FAQ and rating-free schemas. Focused tests: 9 passed; owned ESLint and token checks passed; four 1440/390 component renders passed. Audit: `audit/P2-pricing-notes.md`; manifest: `audit/files-P2-pricing.txt`. Initial concurrent typecheck issues are resolved; shared full gates and final visual acceptance are recorded in `audit/P2-gates.md` and `audit/P2-notes.md`. No commits/deploys/payments.

## Gates (each task, then integration)

P2 delegated account source **stable** (3 October): dashboard/profile rider caps/refinements, one-bike gates, RP7 prompt, legacy report markings, authorized wizard/Welcome integration and selected-bike BikeProfile/RP8 integration complete. All C-reported account regressions resolved (183 tests / 16 files); final expanded Wizard/Welcome/Bike/Profile suites 53 tests / 7 files pass, along with scoped ESLint and TypeScript. Audit `audit/P2-account-notes.md`; manifest `audit/files-P2-account.txt`; handoff `messages/P2-account-stable.md`. No account source blockers; parent owns final full gates/visual QA. No commits/deploys.

Focused vitest, `npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run test:contracts`, `npm run build`,
Convex standalone tsc, `scripts/seo-crawl-check.mjs --local`; NL/EN 1440/390 sweep of pricing, checkout steps, results,
settings, dashboard; renders next to the boards in `renders/` (git-ignored). Tests for: flag off = today's behaviour; flag on =
gating rules; checkout cannot proceed without the withdrawal checkbox; every Stripe call path shows the not-implemented message;
no €9/€12,50/"/ maand". Notes `audit/<id>-notes.md`, manifests `audit/files-<id>.txt`. Print `DONE P1` / `DONE P2` / `DONE P3`.

## P1 complete — 4 October 2026

Products, owner/bike entitlements, expiry, default-OFF enforcement, 80/20 scoring, server guards, report/PDF/mail access and dry-run-first transition are complete. C reran the combined integrated gates after B's DONE P2: typecheck, lint, 3,323 unit tests (20 skips), 490 contracts, Convex tsc, build, 875 crawl checks and email previews pass. B's 200-case visual acceptance is complete; all earlier findings are closed. Current evidence: `audit/P1-notes.md` and `audit/P3-integrated-gates.md`. No commit, deployment, payment, mail or production data operation.

## P3 complete — 4 October 2026

Shared Stripe stub, inert adapters/webhook, five service emails plus M13 and updated M04/M08/M10, canonical-price copy and regression guards are complete. Final integrated rerun passes: typecheck, lint, 3,323 unit tests (20 skips), 490 contracts, Convex tsc, production build and local crawl (875 checks, zero findings). Regenerated 34 bilingual HTML/text previews and 68 screenshots pass. B's 200-case visual review is accepted; stale pending-review notes are superseded. Evidence: `audit/P3-integrated-gates.md`, `audit/P3-notes.md`; files: `audit/files-P3.txt`. No commit/deploy, mail, payment or production writes.

## P4 complete — 4 October 2026

Rebased feature/pricing-v3 onto the live BikeFitBoost rebrand b16f970; rewritten pricing commit is 3c89060. All conflicts resolved with pricing logic preserved and brand name/logo/origin from the rebrand. Checkout and new pricing emails use BikeFitBoost assets and shared-origin configuration. Full gates pass: typecheck, lint including brand guard, 3,349 unit tests (20 skips), 491 contracts, Convex tsc, production build, 875 crawl checks and 34 bilingual email previews /68 screenshots. Current evidence: `audit/P4-notes.md`; files: `audit/files-P4.txt`. No push/deploy or real mail/payment. Final audit updates are uncommitted for review.

## P5 complete — 4 October 2026

Rebased onto main3f3112d6 (migration, Strava retirement, cleanup, build fixes); rewritten pricing commit aad9be0d.
Pricing behavior and plans retained; apex/shared origins, removed integrations/files and build configuration preserved.
Removed a newly reintroduced Strava bike-refinement rule/UI while keeping free80/paid100 score totals.
Final gates: typecheck, lint/brand/domain guard, 3453 unit tests (20 skips), 569 contracts, Convex tsc,
production build SENEn5PVVtanT5WLjdncV, local SEO/domain crawls and38 bilingual email previews/76 screenshots pass.
Evidence: audit/P5-notes.md; files: audit/files-P5.txt. Final fixes/notes uncommitted; no push/deploy/prod/mail.
