# Owner bar: preflight findings, behaviour unchanged

Resolved by Lead in `6d4c2a43`: token-based colors, z-index45 below menu/dialogs, and an in-memory dismissal fallback. A stopped the stale sweep/server, rebuilt final15, and the full332-case automated rerun passes. Fresh manual finalization and combined gates are recorded in `A-guard-final15.md`; the findings below are historical, not current blockers.

A treats the fixed homepage paid bar as the approved rule12 exception. No bar application source or behaviour has been changed.

Confirmed gate failure: `npm run lint` fails in `lint:css-modules` because `StickyConversionBar.module.css:25–26` has two raw `rgba(...)` colors. The contrast token guard itself passes254/254; actual bar contrast still needs browser measurement.

Two source findings need browser reproduction in final15:
- Bar z-index80 is above the shared menu/dialog z-index50. After consent it may cover mobile navigation. Cookie consent normally prevents simultaneous display; actual cookie banner uses z-40, not the95 stated in the CSS comment.
- If sessionStorage writes are blocked, Close catches the write exception and dispatches the event, but the external-store reader still returns false; there is no local dismissal fallback. Normal storage dismissal is not the same as this edge case.

The guard is being extended to capture visible-bar consent, mobile menu, scrolled footer/reserved space, dismissal/session revisit and denied-storage dismissal states. These findings will not be silently exempted under rule12 or fixed by A. Final15 evidence and per-rule results follow.

Homepage mobile length will be reported against final14's NL7.509/EN7.558screens. The existing seven-screen hard limit applies to calculators, not the homepage; A will not invent a different threshold or hide content.
