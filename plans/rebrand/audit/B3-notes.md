# B3 — email rebrand

All shared NL/EN email copy, auth subjects, sender display names, plain-text footers and layout logo now use BikeFitBoost. The new PNG is served from the shared site origin at `/brand/png/logo-horizontaal-960.png`, displayed at 172 × 30. Existing support and delivery addresses remain on `bestbikefit4u.eu`. A configured sender address is preserved while its display name is normalized.

`npx vitest run convex/emails convex/lib/brand.test.ts convex/__tests__/auth.contract.test.ts`: 203 tests in 12 files passed, including email and auth contracts. No provider calls, backend reads, production data changes, deploys or sent email.

Integration follow-up: updated CMS canonical-host contract expectations to the new origin and added an explicit former-host rejection regression. Full contract suite passed 477 tests/44 files before that extra row; focused guide contract rerun passed all 18 tests afterward. New guide canonical overrides use the current host, not the redirecting former host.

`node scripts/render-email-previews.mjs`: 22 NL/EN HTML/plain-text previews and 44 screenshots (600/375 px) generated under `plans/rebrand/renders/emails/`. Every render passed asset-loading, table-layout and horizontal-overflow checks. All 44 screenshots were visually inspected in contact sheets: new mark readable, no overlapping text or broken images, consistent footer and CTA layout. These are browser previews, not Outlook/Gmail delivery-client tests. Existing commercial copy is retained: pricing-v3 content is explicitly another release.

| Mail | NL + EN, 600 + 375 px |
|---|---|
| loginCode | PASS |
| resultsSummary | PASS |
| fitReport | PASS |
| fitPassWelcome | PASS (commercial policy unchanged) |
| caseStudyLead | PASS (internal notification intentionally Dutch for either input locale) |
| caseStudyConfirmation | PASS |
| fitReminder | PASS |
| upgradeNudge | PASS (commercial policy unchanged) |
| winback | PASS |
| proExplainer | PASS |
| day1Tips | PASS |

## Release environment handoff

- Convex `SITE_URL`: set to `https://www.bikefitboost.com` at release; used by auth redirects, email CTAs/preferences, and Strava return URLs. No environment variable was changed here.
- Vercel `NEXT_PUBLIC_SITE_URL`: new shared origin override; keep aligned with Convex `SITE_URL`.
- `CONVEX_SITE_URL` / `NEXT_PUBLIC_CONVEX_SITE_URL`: backend endpoints, not the public brand host; do not replace their deployment URLs. Auth provider domain and unsubscribe POST endpoint use them.
- `AUTH_EMAIL_FROM`: address stays unchanged; display is normalized by `emailSender` even if an old display name is configured.
- Auth identity/provider IDs, persisted keys, unsubscribe signing format and email logs are unchanged. No Convex identifiers were renamed.

## CMS inventory limitation

`B3-cms-inventory.md` inventories baseline local JSON artifacts and their route/slug identifiers. Production Convex record count and IDs cannot be determined without reading production, which this task prohibits. No production inspection or migration was attempted; B2 updates only checked-in import artifacts.
