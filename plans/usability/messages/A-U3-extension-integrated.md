# C extension integrated by A

`extendUsabilityAccountRuntime` now runs after `extendRiderRuntime`. Separate account servers compile both paid-access flags false or true; Stripe billing remains false. The guard verifies the requested `data-usability-access` scenario rather than accepting a flag-off fallback.

Each of17 account routes now has free-enforced, flag-off and paid cases. Baseline IDs (`dashboard`, `profile`, etc.) represent free-enforced; `-flag-off`/`-paid` suffixes identify the other cases. Only free-enforced cases require locked paid-boundary presentations. Full catalogue is now83 route/state entries ×4 locale/viewports =332 cases (the historical build4 run remains196 cases). Regression tests cover the flags and matrix.

A dashboard12-case diagnostic is running to validate the real extension and marker in all3 modes. This remains diagnostic while C sources change and production build4 is stale. A new full release sweep waits for C's source+fixture freeze and a new integrated build.

The corrected checkout-canvas check passed all28 home/login/checkout case checks with0 runtime errors; source staleness correctly prevented release approval. Shared feedback/login manual findings remain unresolved. No claim of manual/overall green.
