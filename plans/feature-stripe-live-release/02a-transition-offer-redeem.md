# 02a: Rider redemption of the free transition measurement

**Owner decision (7 Oct 2026, README decision 7):** existing accounts with at least one report get one free losse meting
(3 months valid, redeemable within 2 months after go-live), as in `plans/pricing-v3/RELEASEPLAN.md` → "Overgang voor
bestaande gebruikers". Found in step 01 (`messages/A-transition-launch-followup.md`): the backend mutation
`convex/pricing/mutations.ts` → `redeemTransitionOffer` exists, but **no rider can reach it**: nothing under `src/` calls it.

Worktree `/Users/ortwinverreck/Developer/bikefitboost-stripe`, branch `feature/transition-offer-redeem` (from main @ 0ec8d367).
Absolute worktree paths only; git only as `git -C /Users/ortwinverreck/Developer/bikefitboost-stripe`. No commits, deploys,
env changes, real Stripe calls, real mails or production data. The lead commits and opens the PR.
Follow `AGENTS.md`/`CLAUDE.md`: `v.` validators, `requireUserId()`/`requireXOwner()`, additive schema only.

## Tasks

1. **Status query.** An authenticated query that returns, for the signed-in user only, whether they have a transition
   offer and its state: `none | upcoming (goLiveAt) | available (redeemBy) | redeemed (bikeId, expiresAt) | expired`.
   No other users' data; no contact details.
2. **Redemption journey (NL/EN, 390 and 1440).** Where the rider naturally meets it:
   - dashboard: one calm card while the offer is `available` ("Je gratis losse meting" + valid-until date + choose a bike
     → "Gebruik voor deze fiets"); `upcoming` shows the date it becomes usable; hidden when none/redeemed/expired;
   - at the paid limit of a bike (the single-measurement / locked-preview moments built in usability v2): when the offer
     is available, offer "Gebruik je gratis meting" for this bike **before** the paid option, never instead of the price info.
   - confirmation step stating it is for this bike only and valid 3 months; after redemption the bike shows full access.
   - errors from the mutation (`TRANSITION_OFFER_UNAVAILABLE`, `…_ALREADY_REDEEMED`, `…_NOT_FOUND`) map to clear copy.
   Follow the existing design system and the usability rules (no pop-ups/countdowns/fear, 44 px targets, contrast, real
   features only). If a canvas board in `plans/pricing-stripe/boards/` or `plans/usability/canvas/project/` covers this,
   follow it and name it in the notes.
3. **Sequencing for the announcement.** The announcement goes out 14 days before go-live and should mention the free
   measurement. Make sure the transition grant can create the offers **ahead of go-live** (redeemable only from
   `goLiveAt`, as the mutation already enforces), still dry-run first and admin-triggered per
   `plans/pricing-v3/audit/P1-transition-runbook.md`, so the announcement sender's "persisted offer" evidence exists.
   Update the runbook accordingly. Do not run anything against a deployment.
4. **Reminder link.** The 7-day reminder mail must link to the place where the rider can redeem (the dashboard card),
   not a generic fit route.
5. **Tests:** query states, redemption per bike, double redemption, wrong owner, before go-live / after redeemBy, UI
   states with mocked data, and that nothing shows for accounts without an offer. Billing flags OFF must not hide a
   valid offer after go-live, and must not enable any Stripe path.

## Gates

typecheck, lint, test:unit, test:contracts, test:i18n, Convex tsc, build, email previews for the reminder, visual check
NL/EN × 390/1440 of the dashboard card and paid-limit states (available / upcoming / redeemed), and the usability guard
(`scripts/usability-check.mjs`) for the touched pages.

## Output

`audit/02a-notes.md` (changes, tests, screenshots list, open points) and print `DONE T1`.
