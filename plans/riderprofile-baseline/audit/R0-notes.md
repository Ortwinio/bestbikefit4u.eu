# R0 baseline measurement

Implemented only in the baseline worktree, independently of rider-profile F1. No visual changes, commit, deploy or production data access.

## Events
One tracker in the public layout listens for trusted browser edits inside calculator inputs and a rendered result. Untouched defaults, hydration and programmatic prefill do not count. Result views are emitted once per route visit after consent; login CTA clicks use the same consent pipeline. All eleven calculator IDs and pressure aliases are recognized. Login links carry only calculator attribution in `src`.

Both new event types are anonymous-allowed. Their payload is restricted to event type, calculator ID (`sourceTag`), locale and clean path. The server rejects extra fields and query/hash-bearing paths. No body, bike or fitness values leave the tracker.

## Read-only report
`convex/analytics/baseline:riderProfileBaseline` returns aggregate counts, medians and ratios. The CLI runs only this internal query via `convex run --prod`; it never pushes or deploys. After release, run:

```sh
node scripts/riderprofile-baseline.mjs --from 2026-10-03 --to 2026-10-17
```

Dates are UTC, start inclusive/end exclusive; do not run this example until the end date has passed. JSON and Markdown are written under this plan. Production execution was deliberately not attempted: the new query has not been deployed.

Historical profile snapshots do not exist. Day-7/day-30 historical medians therefore return null; a separately labelled current median for age-eligible cohorts is provided. Latest calculator-state rows cannot count every past edit; monthly output explicitly measures latest rows per active updater. `lastLoginAt` cannot reconstruct overwritten earlier visits; 30-day returns are a documented lower bound with unknown users. Login events are counts attributed through `src`, not unique linked conversion cohorts. Feedback follows the recommendation session through report time. No identifiers or measurement values are returned.

## Validation
- Integrated analytics, report and calculator regressions: 117 passed, 20 existing skips.
- Typecheck and all lint gates passed (254 contrast checks; image budget clean).
- Final production build passed.
- Chromium trusted-event smoke: 7/7 passed; see `verify-events.json` and reproducible `verify-events.mjs`.
- `git diff --check` passed.
