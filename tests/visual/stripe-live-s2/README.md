# S2 isolated personal sales verification

Preparation only, safe while the UI owner is still editing:

```sh
/opt/homebrew/bin/node /Users/ortwinverreck/Developer/bikefitboost-stripe/tests/visual/stripe-live-s2/capture.mjs --prepare
```

After the owner confirms the pricing and checkout changes are finished:

```sh
/opt/homebrew/bin/node /Users/ortwinverreck/Developer/bikefitboost-stripe/tests/visual/stripe-live-s2/capture.mjs --capture
```

The fixed worktree path is explicit. Preparation compiles two in-memory esbuild bundles plus real Tailwind styles, without launching a browser or writing captures. No Next build or environment files are used. OFF means both personal sales variables are absent; ON means both equal the exact string `true`. This matrix verifies presentation, not server authorization or flag independence (covered by the focused unit tests).

The 16 cases combine pricing and checkout step one, OFF/ON, NL/EN, and 1440/390 widths. Checkout uses an authenticated, standalone-eligible fixture so both personal products are exercised. The runner checks unavailable cards and purchase controls when OFF, personal selection when ON, bracketed appointment placeholders when ON, axe without disabled rules, document overflow, browser errors, and unexpected requests. Service callbacks fail if invoked. Network access is limited to the loopback fixture; external requests and API requests are blocked and fail the run.

Real components and CSS modules are bundled. Existing pricing-ui runtime/UI adapters and account-batch1 link/image adapters are reused. Source hashes cover bundled local modules and globals; source changes during capture fail the run. These fixtures do not prove live authentication, Stripe, backend integration, Next layouts, or hydration. The fixture agenda URL is never visited.

Screenshots: `/Users/ortwinverreck/Developer/bikefitboost-stripe/plans/feature-stripe-live-release/renders/S2-{pricing|checkout}-{off|on}-{nl|en}-{1440|390}.png`.

Audit: `/Users/ortwinverreck/Developer/bikefitboost-stripe/plans/feature-stripe-live-release/audit/S2-visual.json`.

Inspect screenshots after capture; automated checks alone are not visual approval. A nonzero exit indicates a failed assertion, axe violation, overflow, browser/request error, missing capture, or source change. UI fixes belong to the UI owner.
