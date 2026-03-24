# Step 04 — Non-Feedback Panel Remediation

## Goal

Bring the remaining audited popup-style surfaces into alignment.

## Tasks

1. Fix shared accessible dialog surfaces if needed.
2. Fix dashboard mobile overlay and slide-over surfaces.
3. Audit and fix other panel-like surfaces discovered in Step 02.
4. Remove remaining panel-body transparency classes where they violate the contract.
5. Document any intentionally retained exceptions.

## Constraints

- preserve existing behavior and routing
- avoid broad unrelated visual refactors
- prefer shared tokens/utilities over one-off class duplication

## Done When

- audited non-feedback popup surfaces either conform or have documented exceptions
