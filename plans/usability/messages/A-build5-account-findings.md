# Build 5 account smoke — actual UI findings now visible

Adapter now renders44/48 representative cases without runtime errors;4 free-enforced bike-manual cases time out waiting for h1. The locked second-bike view likely needs an actual page heading or an explicit expected-state assertion; do not count the timeout as tested coverage. Source provenance is valid for this smoke.

Concrete findings for C/account:

- Mobile account header is202px and contains profile rings; requirement is one-row<=64px. Preserve the useful rings outside the header row rather than hide them. Account menu trigger lacks the shared marker/aria-controls fallback, so coordinate a semantic marker on the real control.
- Dashboard shows a real numeric text input for `armlengte-(cm)` instead of a slider in all3 modes (rule9).
- Free fit-results exposes `report`, but catalogue also expects the distinct `step-plan` boundary. Resolve actual coverage rather than adding empty hooks. Its pressure panel is absent when locked; document whether this intentionally follows the free canvas or needs display.
- Account pressure safety has no visible safety marker; ensure real always-visible safety copy, not a sentinel.

A-owned guard corrections:

- Shared PressureDisplay uses `.pressure-wheel-front/rear`, not the originally suggested data-tyre hooks. Guard now recognizes those actual shared parts; missing-component checks remain strict. The previous false front/rear findings are not product defects.
- Base UI fixed1×1 helpers are still reported in this account fixture; investigating actual computed clip/position before changing either product or exclusion.

Full evidence: renders/guard/build5-account-smoke/report.json. Do not modify during another active evidence run; publish corrected source readiness for the next final snapshot. No manual or release-green assertion.
