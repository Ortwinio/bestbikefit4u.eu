# U3 account runtime extension for A

Ready in `tests/visual/usability/extend-runtime.mjs`:

```js
import { extendUsabilityAccountRuntime } from "../usability/extend-runtime.mjs";
// In account-fixture.mjs runtime onLoad, directly after extendRiderRuntime:
contents = extendUsabilityAccountRuntime(contents, { root, batch: key });
```

`root` must be explicit `/Users/ortwinverreck/Developer/bikefitboost-usability`. The extension is pure and inserts before readRiderFixture so modern reliability/pressure/advice states win, while unknown reads still throw. It does not change mutation/action behavior or send data. Existing non-usability fixtures default to flag-off.

## Three explicit modes

All actual account fixture paths accept `?access=flag-off`, `?access=free-enforced`, `?access=paid`; preserve existing `fixture` separately. Example NL/EN URLs:

- `/nl/dashboard?access=flag-off` / `/en/dashboard?access=flag-off`
- `/nl/bikes?access=free-enforced`, `/nl/bikes/new?access=free-enforced`
- `/nl/profile?access=free-enforced`, `/nl/profile/score?access=free-enforced`
- `/nl/fit/visual-session/results?access=free-enforced`, `/nl/fit-history?access=free-enforced`
- `/nl/bikes/compare-fit?access=free-enforced`
- every counterpart `?access=paid` exercises an actual active annual fixture entitlement, not legacy tier=pro.

**Required compile flag:** `NEXT_PUBLIC_PAID_ACCESS_ENFORCED` and `PAID_ACCESS_ENFORCED` must both be `"false"` in flag-off bundles, both `"true"` in free-enforced/paid bundles. Stripe billing flags are separate; leave those false. Compile separate open/enforced bundles and choose the matching script by access query, OR run separate fixture servers with explicitly matching bundle flags. Do not silently alias flag checks to policy values.

The extension asserts actual `isPaidAccessEnforced()` matches the requested mode and sets `document.documentElement.dataset.usabilityAccess` to the requested mode. Guard must verify marker and actual boundary content. Mismatch throws instead of claiming coverage.

## Actual APIs and data

Pure shared getAccess derives all access. calculatorData returns measured profile input metadata. Account saddle uses the shared model with one actual fixture measurement, no invented repeats/video. Dashboard returns ranges from existing recommendation centres. Report fixture retains current core/full gates and latest-report PDF/email allowance. Pressure is recalculated by the real engine from explicit 74/75kg rider, 8.5kg road bike,28mm tubeless average asphalt; report and advice use that output. Advice uses production groupAdvice, allowing real AdvicePage pressure components to render. Deliberate loading,missing-profile,no-pressure cases remain available; unknown query errors remain visible.

These are deterministic presentation fixtures only: they do not certify mutation persistence or authorize real backend operations. No green guard is claimed until A runs the matching build and checks real rendered states.

## Access smoke follow-up (6 October)

Added `recommendations/queries:getReportAccess` with actual contract: enforced,fullReport,legacyFullAccess,isLatestReport,canDownloadPdf,canEmailReport. Extension now passes query args to state reader. Only an owned known session returns access; latest free report permits PDF/email; older free report does not; paid or flag-off permits both. Loading remains undefined. Added `pricing/queries:getSubscription` for settings with actual shared-policy access, explicit annual fixture entitlement/current PRODUCTS price, null transition offer.

Proactive scan of useQuery/usePaginatedQuery under dashboard, profile, bikes, reports and welcome against all runtime values found these two missing modern reads. Remaining uncovered names outside scope: gifts overview/home showcase/checkout status (root checkout adapter). Geometry model/size/record reads are skipped because fixture brands/geometry are deliberately empty; destructive preview is skipped unless its dialog opens (outside read-only guard). Unknown reads continue throwing; no generic fallback was added.

Fixture source frozen again after focused 9 Vitest state tests +5 Node transformer tests. A can rerun diagnostics with same integration API. Product sources unchanged in this follow-up.
