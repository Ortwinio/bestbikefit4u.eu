# Checkout rule5 corrected to its dedicated canvas

Verified `afsluiten/Kies.dc.html` and CheckoutFlow: checkout intentionally uses back +progress, not a marketing menu. Per README canvas precedence, the guard now requires its real visible back link/button (>=44×44), header<=64px at390, and no cookie/header overlap. Other page kinds still require their menu; the regression tests reject missing/undersized checkout back controls and do not exempt marketing pages.

The10 historical build4 rule5 checkout failures therefore represent a guard expectation mismatch, not a requested marketing-menu insertion. The raw report is preserved; a28-case home/login/checkout diagnostic is running to validate the corrected expectation. Final release still needs a frozen integrated build and manual review.

The runner now uses a bounded4-case pool, with isolated browser contexts and error-draining tests, to avoid sequential timeout delays. Full case-count/provenance/manual gates remain unchanged.
