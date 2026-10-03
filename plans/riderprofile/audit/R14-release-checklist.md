# R14 release checklist

Preparation only: no deployment, migration, production export or production mutation has been run here.
Ortwin approved phases 1–4 for the next release; final release timing and production operations remain
lead-owned. This checklist does not certify gates that are still being run by the integration owner.

## Freeze and evidence

- [x] Integrate latest `origin/main` (PR9 baseline `e93f8c1`) without losing concurrent rider work.
  Preserve the server dashboard layout's `noindex,nofollow` metadata and move interactive header/rings
  into `DashboardLayoutClient`. Preserve explicit private/PDF SEO policies and the standalone Convex config.
  Lead checkpoint d8726c5 rebased to 169f7fc; subsequent integration fixes are uncommitted.
- [ ] Record final reviewed SHA, dependency lockfile, environment/deployment identifiers (no keys),
  previous frontend/backend release references, and each owner’s audit/file manifest. No PNGs in file lists.
- [x] Source issues resolved (A fixed B/C findings with lead approval). Freeze the candidate before final gates; rerun affected gates
  if code changes after the captured source hash.
- [x] Run and retain exit status/log references for all commands below from the rider worktree (R14-notes.md):

```sh
npm run typecheck
npm run lint
npm run test:unit
npm run test:contracts
npm run build
npx tsc -p convex/tsconfig.json --noEmit
node scripts/seo-crawl-check.mjs --local --skip-build --label=r14
node tests/visual/final-sweep/sweep.mjs --output=plans/riderprofile/renders/R14-final-sweep --label=r14-final --workers=6
```

- [x] Sweep covers NL/EN × 1440/390 with axe enabled, all active routes plus new welcome/score/advice
  routes. Account query fixtures must implement current provenance/prompts/advice/calculator-chain contracts;
  no loading-only fallback may masquerade as a complete page. Record fixture limitations explicitly.
- [x] Render/review actual RP1–RP8 and sidebar states next to the boards, including empty, partial, complete,
  conflict, stale, pending and error states where relevant. Validate small-screen overflow and meter labels.
  See R14-board-coverage.md for refreshed coverage, including the R16 performed/feedback journey.
- [x] Local production build crawl confirms private routes/PDF remain noindex and public title/description,
  canonical and locale alternates stay in head for all tested user agents. No privacy-sensitive URLs/logs.

## Environment inventory — names only

- Frontend: `NEXT_PUBLIC_CONVEX_URL` must target the intended released backend, never loopback.
  Verify `NEXT_PUBLIC_CONVEX_SITE_URL` where configured and `SITE_URL` point to intended origins.
- Backend auth/email: retain valid `AUTH_RESEND_KEY`, `AUTH_EMAIL_FROM`, `SITE_URL`, `CONVEX_SITE_URL`
  and existing auth signing configuration. `EMAIL_UNSUBSCRIBE_SECRET` must remain stable and valid
  (source requires at least 32 characters); rotating it invalidates existing signed preference links.
- If Google login is enabled, verify `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and frontend
  `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` agree with configured callback origins.
- Keep `NEXT_PUBLIC_ENABLE_LOCALHOST_DEV_LOGIN` disabled and development-only login secrets out of
  the production environment. No development identity or local Convex endpoint may enter the release.
- Preserve the approved billing state: `STRIPE_BILLING_ENABLED` and
  `NEXT_PUBLIC_STRIPE_BILLING_ENABLED` stay false while payments are paused. Do not enable billing
  as part of rider rollout. If policy changes later, billing preflight additionally checks `STRIPE_SECRET_KEY`,
  `STRIPE_PRO_MONTHLY_PRICE_ID`, `SITE_URL`; Convex separately needs its webhook configuration.
- Review environment presence privately, never paste `.env` contents or secret values into audit evidence.
  No new environment requirement is inferred solely from this checklist; compare final merged source.

## Deploy order and migration

1. Lead explicitly authorizes the exact candidate and production target. Confirm backup/restore ownership,
   recent private export, operational monitoring and an available rollback decision-maker.
2. Deploy Convex schema/functions **first** using the established approved deployment process. New profile
   fields/provenance are additive/optional for existing records; do not make legacy measurements mandatory.
   Confirm schema compatibility and auth/ownership guards before serving a frontend that calls new APIs.
3. Perform the separately approved migration dry-run in `R14-migration-dry-run.md`; review aggregate counts.
   Actual migration writes need another explicit approval. The frontend has conservative legacy fallback;
   do not invent measurements merely to eliminate missing provenance or force a migration through.
4. Deploy the matching frontend only after backend readiness and candidate gates pass. Release phases 1–4
   together as approved, not a partially exposed subset. Include completed newsletter/browser-retention/
   demographic work in the same verified contract; do not enable unsupported demographic estimates.
5. Run private controlled-account smoke checks below. No bulk recalculation, email send or production write
   is implied by this document; use designated test accounts and explicit smoke authorization.
6. Lead records go/no-go, monitors failures, and schedules the agreed measurement baseline/follow-up.
   Events contain categories/counts only, never rider measurement values.

## NL/EN smoke matrix

Run both `/nl` and `/en`, desktop and 390px mobile:

- Public `/calculators/saddle-height` and other calculators: default fields are not handed off; touched
  data remains visible; locale switch stays correct. No body values in URL, cookies or analytics.
- `/login` → `/welcome`: touched-only handoff survives login, conflict choices work, cancel/confirm clear
  the buffer. Newsletter choice starts unchecked; declining preserves access. Verify mail locale only
  using an authorized controlled inbox, not real rider accounts.
- `/dashboard`, `/profile`, `/profile/score`: live rings/no fake loading zero; correct bilingual levels,
  provenance and next steps; source/date editing and conflicts; prompt skip/later limits; consent withdrawal.
- Account calculators (`/tools/*`, `/gearing`, `/saddle-selector`, `/pressure-calculator`): current profile/bike
  inputs, explicit missing-input handling, per-advice confidence and next-tool links. Local-only overrides
  must not silently rewrite the rider profile; existing dashboard scores remain present.
- Advice view at its final owner-registered route/tab: grouped values/ranges/date, stale state after an
  input change, authorized recalculation statuses and missing-input skips. Pending fit replacement leaves
  the old report accessible; successful replacement must not send an unsolicited email.
- `/profile/advice`: mark an actual outcome performed with date/note, reload, confirm waiting for ride
  feedback, submit better/same/worse, reload, confirm performed. Explicitly link an eligible existing ride;
  verify its original data remains unchanged. Recalculate and confirm new status even for unchanged
  outputs. Verify another account cannot mutate it and deleting its source removes embedded progress.
- `/bikes` and an owned bike detail: real completeness/quality and geometry/setup sources; another user's
  bike cannot be read or mutated. Check adjustment-room warnings without invented fit certainty.
- `/email-preferences` and profile newsletter toggle: bilingual consent, unsubscribe and persisted state.
  Accepted browser storage expires at 30 days; essential/no consent remains session-only; withdrawal,
  logout and confirmed/cancelled handoff clear data according to final R12 contract.
- Signed-out private routes redirect safely and expose no private data. Verify private metadata/PDF noindex,
  language navigation, keyboard focus, reduced-motion behavior, contrast and no runtime/hydration errors.

## Stop / rollback

Stop rollout on failing required gates, wrong backend/environment, ownership/privacy leak, fabricated
measurement provenance, lost report, broken auth, unexpected email sends, cross-account autosave, or
incomplete phase contracts. Assign blockers to A/B/C by file ownership; do not waive privacy/auth failures.

Rollback is not a single command: keep the compatible additive backend when reverting the frontend.
Do not redeploy an older restrictive schema blindly. Migration rows, consent records, saved inputs and
scheduled work survive frontend rollback; deleting them or restoring a database can destroy legitimate
post-release changes. Follow the separately approved data-recovery plan and preserve private backups.
