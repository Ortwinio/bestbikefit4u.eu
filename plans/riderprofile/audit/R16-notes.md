# R16 performed advice and ride feedback

Implemented on the rebased rider candidate, with no commit, push, deployment or production data access.

## Behaviour

- Owner-authenticated per-item progress persists with each source outcome. Marking requires a UTC
  calendar date and accepts an optional note. Until explicit ride feedback, status is
  `wacht op ritfeedback` / `waiting for ride feedback`; better/same/worse completes it.
- Existing eligible ride records can be linked explicitly. Their comfort score is not converted into
  an invented outcome; the rider still selects better/same/worse. Original ride records are unchanged.
- Calculation revisions invalidate old requests and reset advice to new, including same-value,
  same-clock recalculations. Stale advice preserves history while retaining its stale warning.
- Source, item, rider, bike and session ownership are checked server-side. Duplicate identical requests
  are idempotent; conflicting duplicates return localized refresh guidance. No optimistic completion.
- Optional embedded fields need no progress backfill and disappear with the source on existing deletion
  paths. Notes stay in account data, not URLs or analytics. Existing measured/profile values are untouched.
- NL/EN forms have visible labels, date guidance, optional 500-character notes, pending/error states,
  keyboard-accessible feedback choices and 44px controls. Revision changes reset any open form.

## Validation boundary

Backend focused tests: 98. UI focused tests: 86. Root adds six real-handler query/mutation integration
tests covering all three feedback outcomes, scoped ride reuse, authentication change, stale history,
input-only advice and recalculation reset. Browser renders use deterministic Convex boundary fixtures;
they prove UI behaviour, not a deployed database round trip. Full candidate gate results are recorded
in R14-notes.md after the post-R16 rerun. No live persistence claim is made.

See R16-backend-notes.md for the API/persistence contract and R14-board-coverage.md for rendered evidence.

## Accessibility follow-up

Unfiltered axe on all 48 interactive fixture states exposed low-contrast conditional error text,
an opacity-reduced pending note label and missing mobile-shell landmarks. Fixed the error to use
`text-destructive-text`, kept pending notes read-only rather than dimmed/disabled, and made the
mobile account header a real header landmark. Generic count spans now expose localized hidden text
instead of an unsupported aria-label. Regression tests cover these changes. The fixture also gained
its missing document title. No axe findings were suppressed; SVG-centred ring text requires manual
contrast review, recorded in R16-render-notes.md. Sidebar items clipped by the internal scroll viewport
also remain incomplete in axe: browser checks verify all 31 links per locale become focused/reachable
after scrolling; inactive/active contrast is 14.02:1/12.80:1. No visual redesign or unrelated shared-input change.

Final R14 rerun: typecheck, lint, 2848 unit tests (20 existing skips), 477 contracts, production build,
standalone Convex tsc and 1145 local crawl checks pass. Full route sweep: 320/320, axe zero skips.
All-board refresh: 184 existing cases/flows plus 48 R16 cases; unfiltered R16 axe has zero violations.
