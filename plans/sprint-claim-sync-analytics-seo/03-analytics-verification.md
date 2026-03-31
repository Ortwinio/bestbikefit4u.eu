# T03 — Verify analytics event pipeline end-to-end

**Ticket:** T03
**Effort:** 1 developer-day
**Blocks:** T04

---

## Context

`GTMConsentLoader`, `TrackedCtaLink`, and `MarketingEventTracker` are all implemented in the codebase. There is no confirmed evidence that:

1. The GTM container ID is set in the production environment
2. GA4 is receiving events from the GTM container
3. The Convex `logMarketingEvent` mutation is writing records in production
4. Events respect cookie consent (fire only after "accepted", not on page load)

This ticket is a verification-first, fix-second task. The expected outcome is either "pipeline confirmed working" or a prioritised list of specific fixes applied.

---

## Pre-conditions

Before starting:

- [ ] Confirm `NEXT_PUBLIC_GTM_ID` (or equivalent) exists in Vercel project environment variables for both Preview and Production
- [ ] Confirm a GA4 property exists and its measurement ID is linked to the GTM container
- [ ] Confirm Google Tag Manager container is published (not in draft)

If any of these are missing, create them before proceeding with the verification steps.

---

## Verification steps

### Step 1 — GTM container load

Open staging in Chrome. Open DevTools → Network tab. Filter by `gtm.js`.

**Pass:** `gtm.js` loads after cookie consent is accepted. 0 requests before consent.
**Fail:** `gtm.js` loads on page entry without consent, or never loads.

Fix if failing:
- Check `GTMConsentLoader` receives a non-undefined `gtmId` prop in the root layout
- Check that `canTrackMarketing()` returns `false` before consent and `true` after

### Step 2 — CTA click event

1. Accept cookies on staging homepage
2. Open GA4 DebugView (`https://analytics.google.com/` → your property → DebugView)
3. Click the primary hero CTA button
4. Wait up to 10 seconds

**Pass:** A `cta_click` event appears in DebugView with parameters:
- `section: "hero_primary"`
- `page_path: "/"`
- `locale: "en"` (or "nl" depending on test locale)

**Fail:** No event appears, or event appears without expected parameters.

Fix if failing:
- Inspect `TrackedCtaLink.tsx` — confirm it calls `logMarketingEvent` mutation
- Inspect GA4 tag in GTM — confirm it is set to fire on `All Events` or has an explicit trigger for custom events
- Confirm the GTM data layer push is formatted correctly

### Step 3 — Full funnel event coverage

Manually walk the full funnel on staging. In GA4 DebugView, confirm all of the following events arrive in order:

| Step | Event | Trigger |
|------|-------|---------|
| Homepage load | `funnel_landing_view` | Page renders |
| Click any CTA | `cta_click` | Button click |
| Login page load | `funnel_login_view` | Page renders |
| Enter email and request code | `login_code_requested` | Form submit |
| Verify code | `login_verified` | Code accepted |
| Profile page load | `funnel_profile_view` | Page renders |
| Complete questionnaire | `questionnaire_complete` | Final step submit |
| Results page load | `funnel_results_view` | Page renders |

**Pass:** All 8 events appear in DebugView in order.
**Fail:** Any event is missing or fires with wrong parameters.

### Step 4 — Consent enforcement

1. Open a fresh incognito window on staging
2. Do NOT accept cookies
3. Navigate to homepage → click a CTA
4. Check GA4 DebugView — the device should not appear

**Pass:** Zero events in DebugView for the incognito session without consent.
**Fail:** Events appear before consent is given.

Fix if failing:
- `canTrackMarketing()` in `TrackedCtaLink.tsx` must return `false` before consent
- `GTMConsentLoader` must not load the GTM script before consent

### Step 5 — Convex event logging

1. As an authenticated user on staging, click several CTAs
2. Open Convex dashboard → Data → `marketingEvents` table (or whatever table `logMarketingEvent` writes to)
3. Verify rows are being created with correct `eventType`, `pagePath`, `section`, `locale`

**Pass:** New rows appear within 5 seconds of each click.
**Fail:** Table is empty or rows are missing fields.

### Step 6 — Source attribution tag

1. Click a pricing page CTA that links to `/login`
2. Inspect the URL you land on — it should contain `?src=pricing_tier_pro` (or similar)
3. Confirm this `src` parameter is visible in GA4 session source dimension

**Pass:** `src` query param is present on the login URL and GA4 records the source.
**Fail:** Parameter is missing — check `TrackedCtaLink.tsx` `appendSrcParam` logic.

---

## Fixes to apply based on findings

Document any failures found above and apply fixes before closing this ticket. Common issues:

| Failure | Likely fix |
|---------|-----------|
| GTM never loads | Missing `NEXT_PUBLIC_GTM_ID` env var |
| Events fire before consent | `canTrackMarketing()` not called before `logMarketingEvent` |
| Events reach Convex but not GA4 | GTM tag missing or not published |
| Source param missing | `TrackedCtaLink` condition on login URL not matching |
| `logMarketingEvent` mutation fails silently | Check Convex function logs for errors |

---

## Acceptance criteria

- [ ] GTM container loads on staging only after cookie consent is accepted
- [ ] All 8 funnel events appear in GA4 DebugView during a manual walkthrough
- [ ] Zero events fire in a fresh incognito session without consent
- [ ] `marketingEvents` table in Convex receives rows for each tracked click
- [ ] `src` query param is present on `/login` URLs from tracked CTAs
- [ ] All of the above verified against the **production** environment after deploy

## Edge cases

- CSP in `next.config.ts` must allow `googletagmanager.com` — verify it does after any recent config change
- GA4 DebugView only shows your own device. Use a separate test account and incognito session to verify consent enforcement
- If GTM container is in draft (not published), events will not fire in production

## Human audit checklist

- [ ] Open staging, accept consent, click hero CTA — event in DebugView within 10s
- [ ] Open staging incognito, decline consent, navigate — no events in DebugView
- [ ] Open Convex dashboard — confirm `marketingEvents` rows created
- [ ] Verify same behaviour on production after deploy
