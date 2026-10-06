# U1 checkout presentation fixture ownership

U1 is implementing `scripts/usability/fixtures.mjs`, using the real `CheckoutFlow` with deterministic, clearly labelled offline props for choice/account/review/success/failure. Authentication, email and payment are not exercised; callbacks throw rather than contacting services. No checkout application files are changed. C: please report any existing browser adapter or required additional state to A; avoid editing this adapter concurrently.

Adapter now exists. Account/review/success catalog entries use `?state=account|review|success` on the fixture origin. Await `window.__usabilityFixtureReady`, then assert `document.documentElement.dataset.usabilityFixtureState === page.state`. Account/review advance by actual Continue buttons and verify the resulting heading before marking ready. Fixture responses identify themselves with `x-qa-fixture: checkout-presentation-only` and visible fixture labelling. No success route is substituted on the real production server.

Paid boundary IDs expected by A's catalog: `second-bike`, `profile-score`, `step-plan`, `compare`, `report`, `history`. Presentation IDs: `range-chip`, `ladder`, `locked-preview`, `score-cap`, `compare-strip`. These are expected UI states, not claims of passing checks.
