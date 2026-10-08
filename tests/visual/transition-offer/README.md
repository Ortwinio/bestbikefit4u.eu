# Transition-offer visual sidecar

Implemented and captured: all 24 cases pass. `entry.jsx` imports the production `TransitionOfferView` and
`PaidBoundary`; `runtime.jsx` supplies local mocks. The handoff checklist below records the original setup.

The redeemed paid-limit fixture proves offer disappearance only; it retains standalone price context rather than
rendering the full application report. Backend redemption/access tests prove entitlement activation. Confirmation
and error handling are tested separately with local callbacks. See `audit/02a-notes.md` for final verification.

The runner fixes its worktree to `/Users/ortwinverreck/Developer/bikefitboost-stripe` and defines 24 cases: dashboard / bike paid limit × available / upcoming / redeemed × NL / EN × 390 / 1440. Billing flags are OFF; paid access is enforced. It uses the existing esbuild, PostCSS, Playwright and axe pattern without running a Next build. Requests are restricted to fixture document/script/style/font/image resources; APIs, external requests, WebSockets, workers and form submissions are blocked.

## Original interface handoff checklist

- Actual production component path and export names for the dashboard card and bike paid-limit surface, including whether the latter includes its paid price/access context.
- Exact props: locale handling, bike ID/name/list shape, offer discriminant and timestamp fields, and redemption callback or Convex hooks.
- Exact `pricing/queries:getTransitionOffer` response, especially whether the discriminant is `state` or `status`; do not invent `{ state: "none" }` versus `{ status: "none" }`.
- Confirmation controls, localized names, mutation success return and subsequent access-query response. The redeemed dashboard should be absent; redeemed bike context must show access rather than a blank fixture.
- Parent confirmation of UI/source freeze and completed build before capture and final route guard.

After handoff, add `entry.jsx` importing the actual production components and, if needed, `runtime.jsx` providing explicit query results. Unknown queries and any mutation/action must fail closed. Set `window.__transitionFixture` with `ready`, an initially empty `calls` recorder and `verifyState()` returning nonempty `{ name, passed }` assertions derived from the rendered DOM. Do not use cloned component markup or snapshots of unrelated components. Include paid price preservation, available CTA ordering, upcoming availability date, and redeemed visibility/access assertions. Check confirmation and mapped errors separately with local callbacks, without contacting a backend.

Legacy usability guard fixtures are extended centrally through `tests/visual/usability/account-states.ts`; add a handled `pricing/queries:getTransitionOffer` response with the confirmed default-none shape there. This covers the profile, fit, tools and bikes adapters. Standalone account-batch captures bypass that extension, so update only the relevant existing adapters if the parent runs them.

After the parent handoff, run:

```sh
node /Users/ortwinverreck/Developer/bikefitboost-stripe/tests/visual/transition-offer/capture.mjs --parent-freeze
```

The command intentionally fails before bundling until `entry.jsx` exists. It writes `plans/feature-stripe-live-release/audit/02a-visual.json` and `plans/feature-stripe-live-release/renders/02a-*.png` only during capture, recording actual screenshot paths only after successful writes. Inspect rendered images before reporting visual completion. The parent owns the final `scripts/usability-check.mjs` command and gate output; select actual touched route IDs after integrations are known. No gates or captures are claimed by this preparation.
